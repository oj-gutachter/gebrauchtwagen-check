'use strict';
/* Sichern & Wiederherstellen: alles bleibt lokal, ohne Konto und ohne Cloud. */
const BACKUP_FORMAT='oj-gebrauchtwagen-check-sicherung';
const BACKUP_VERSION=1;
const BACKUP_MAX_BYTES=1024*1024;
const BACKUP_LAST_KEY='oj-gebrauchtwagen-check.last-backup.v1';
(()=>{
  let pendingRestore=null;
  const isPlainObject=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
  const localIso=(date=new Date())=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
  function backupFileName(date=new Date()){return `OJ-Gebrauchtwagen-Check-Sicherung-${localIso(date)}.ojsicherung`;}
  function checkHasContent(check){
    if(!check)return false;
    return !!check.drivetrain||Object.keys(check.answers||{}).length>0||Object.keys(check.notes||{}).length>0||Object.values(check.vehicle||{}).some(value=>typeof value==='string'&&value.trim())||!!(check.appointment&&check.appointment.date);
  }
  function remindersHaveContent(reminders){
    if(!reminders)return false;
    return Object.entries(reminders).some(([key,value])=>key!=='drivetrain'&&value!==null&&value!=='');
  }
  function buildBackup(){
    return {format:BACKUP_FORMAT,version:BACKUP_VERSION,app:'OJ Gebrauchtwagen-Check',createdAt:new Date().toISOString(),
      data:{check:normalizeState(state),reminders:normalizeReminders(reminderState)}};
  }
  function lastBackupText(){
    let value=null;try{value=localStorage.getItem(BACKUP_LAST_KEY);}catch(_){}
    if(!value||Number.isNaN(Date.parse(value)))return tr('backup.noBackupYet');
    return tr('backup.lastBackup',{date:printDate(value)});
  }
  function rememberBackup(){try{localStorage.setItem(BACKUP_LAST_KEY,new Date().toISOString());}catch(_){}}
  function downloadFile(content,name,type){
    const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
    anchor.href=url;anchor.download=name;anchor.rel='noopener';document.body.appendChild(anchor);anchor.click();anchor.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),4000);
  }
  async function exportBackup(){
    const backup=buildBackup();
    if(!checkHasContent(backup.data.check)&&!remindersHaveContent(backup.data.reminders)){showToast(tr('backup.nothingToSave'));return null;}
    const content=JSON.stringify(backup,null,2)+'\n',name=backupFileName();
    // Nicht application/json: Auf dem iPhone beansprucht sonst eine andere App die Datei.
    // octet-stream behält die Endung .ojsicherung. text/plain nur, falls Teilen den Typ ablehnt.
    window.__lastBackup={name,content,type:'application/octet-stream'};
    if(navigator.canShare&&navigator.share){
      for(const type of ['application/octet-stream','text/plain']){
        let file=null;
        try{file=new File([content],name,{type});}catch(_){continue;}
        let shareable=false;try{shareable=navigator.canShare({files:[file]});}catch(_){}
        if(!shareable)continue;
        try{await navigator.share({files:[file],title:tr('backup.shareTitle'),text:tr('backup.shareText')});window.__lastBackup.type=type;rememberBackup();showToast(tr('backup.shared'));refreshLastBackup();return 'shared';}
        catch(error){if(error&&error.name==='AbortError')return 'aborted';break;}
      }
    }
    try{downloadFile(content,name,'application/octet-stream');rememberBackup();showToast(tr('backup.downloaded',{name}));refreshLastBackup();return 'downloaded';}
    catch(_){showToast(tr('backup.failed'));return null;}
  }
  function refreshLastBackup(){const node=document.getElementById('backupLastInfo');if(node)node.textContent=lastBackupText();}
  // Prüft Format, Version und Aufbau. Liefert {ok:true,backup} oder {ok:false,error:'…'}.
  function validateBackupText(text){
    if(typeof text!=='string')return {ok:false,error:'invalid'};
    if(new TextEncoder().encode(text).length>BACKUP_MAX_BYTES)return {ok:false,error:'tooLarge'};
    let raw;try{raw=JSON.parse(text.replace(/^\uFEFF/,''));}catch(_){return {ok:false,error:'invalid'};}
    if(!isPlainObject(raw)||raw.format!==BACKUP_FORMAT)return {ok:false,error:'invalid'};
    if(!Number.isInteger(raw.version)||raw.version<1)return {ok:false,error:'invalid'};
    if(raw.version>BACKUP_VERSION)return {ok:false,error:'newer'};
    if(!isPlainObject(raw.data))return {ok:false,error:'invalid'};
    const {check,reminders}=raw.data;
    if(check!==undefined&&check!==null){
      if(!isPlainObject(check))return {ok:false,error:'invalid'};
      for(const key of ['answers','notes','vehicle','appointment'])if(check[key]!==undefined&&check[key]!==null&&!isPlainObject(check[key]))return {ok:false,error:'invalid'};
      if(check.drivetrain!==undefined&&check.drivetrain!==null&&!DRIVE_TYPES.includes(check.drivetrain))return {ok:false,error:'invalid'};
    }
    if(reminders!==undefined&&reminders!==null&&!isPlainObject(reminders))return {ok:false,error:'invalid'};
    const normalizedCheck=isPlainObject(check)?normalizeState(check):null;
    const normalizedReminders=isPlainObject(reminders)?normalizeReminders(reminders):null;
    const hasCheck=checkHasContent(normalizedCheck),hasReminders=remindersHaveContent(normalizedReminders);
    if(!hasCheck&&!hasReminders)return {ok:false,error:'empty'};
    return {ok:true,backup:{createdAt:typeof raw.createdAt==='string'&&!Number.isNaN(Date.parse(raw.createdAt))?raw.createdAt:null,check:hasCheck?normalizedCheck:null,reminders:hasReminders?normalizedReminders:null}};
  }
  const sameJson=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  function fillMissing(target,source){
    const out={...target};
    for(const [key,value] of Object.entries(source||{}))if((out[key]===undefined||out[key]===null||out[key]==='')&&value!==undefined&&value!==null&&value!=='')out[key]=value;
    return out;
  }
  // Zusammenführen ohne Duplikate: Was auf dem Gerät steht, bleibt; Fehlendes kommt aus der Sicherung.
  function planRestore(backup,currentCheck=state,currentReminders=reminderState){
    const plan={checkMode:'none',reminderMode:backup.reminders?'merge':'none',check:currentCheck,reminders:currentReminders,answers:backup.check?Object.keys(backup.check.answers).length:0};
    if(backup.check){
      const incoming=backup.check;
      if(!checkHasContent(currentCheck)){plan.checkMode='take';plan.check=incoming;}
      else if(sameJson(normalizeState(currentCheck),incoming)){plan.checkMode='same';}
      else if(currentCheck.startedAt&&incoming.startedAt&&currentCheck.startedAt===incoming.startedAt&&(!currentCheck.drivetrain||!incoming.drivetrain||currentCheck.drivetrain===incoming.drivetrain)){
        plan.checkMode='merge';
        plan.check=normalizeState({...currentCheck,
          drivetrain:currentCheck.drivetrain||incoming.drivetrain,
          answers:{...incoming.answers,...currentCheck.answers},
          notes:fillMissing(currentCheck.notes||{},incoming.notes),
          vehicle:fillMissing(currentCheck.vehicle||{},incoming.vehicle),
          appointment:currentCheck.appointment&&currentCheck.appointment.date?currentCheck.appointment:incoming.appointment,
          completedAt:currentCheck.completedAt||incoming.completedAt});
      }else{plan.checkMode='replace';plan.check=incoming;}
    }
    if(backup.reminders)plan.reminders=normalizeReminders(fillMissing(currentReminders,backup.reminders));
    return plan;
  }
  function applyRestore(plan){
    state=normalizeState(plan.check);save();
    reminderState=normalizeReminders(plan.reminders);saveReminders();
  }
  function dialog(){return document.getElementById('backupDialog');}
  function showBackupError(error){
    pendingRestore=null;
    const key={newer:'backup.errorNewer',empty:'backup.errorEmpty',tooLarge:'backup.errorTooLarge',read:'backup.errorRead'}[error]||'backup.errorInvalid';
    const box=dialog();box.dataset.mode='error';
    box.innerHTML=`<div class="dialog-icon backup-error-icon" aria-hidden="true">!</div><h2 id="backupDialogTitle">${tr('backup.errorTitle')}</h2><p id="backupDialogText">${tr(key)}</p><button type="button" class="button button-primary button-full" data-backup-dialog="close">${tr('backup.errorOk')}</button>`;
    if(!box.open)box.showModal();
    box.querySelector('button').focus();
  }
  function showRestoreConfirm(backup){
    const plan=planRestore(backup);pendingRestore=plan;
    const checkLine={take:tr('backup.checkTake',{n:plan.answers}),merge:tr('backup.checkMerge'),replace:tr('backup.checkReplace'),same:tr('backup.checkSame'),none:tr('backup.checkNone')}[plan.checkMode];
    const reminderLine=plan.reminderMode==='merge'?tr('backup.remindersMerge'):tr('backup.remindersNone');
    const box=dialog();box.dataset.mode='confirm';box.dataset.checkMode=plan.checkMode;
    box.innerHTML=`<div class="dialog-icon" aria-hidden="true">↺</div><h2 id="backupDialogTitle">${tr('backup.confirmTitle')}</h2>
      ${backup.createdAt?`<p class="backup-file-date">${tr('backup.confirmFileDate',{date:printDate(backup.createdAt)})}</p>`:''}
      <ul class="backup-plan"><li class="${plan.checkMode==='replace'?'backup-plan-warning':''}">${checkLine}</li><li>${reminderLine}</li></ul>
      <p id="backupDialogText" class="backup-confirm-note">${tr('backup.confirmNote')}</p>
      <div class="dialog-actions"><button type="button" class="button button-secondary" data-backup-dialog="close">${tr('cancel')}</button><button type="button" class="button button-primary" data-backup-dialog="confirm">${tr('backup.confirmButton')}</button></div>`;
    if(!box.open)box.showModal();
    box.querySelector(plan.checkMode==='replace'?'[data-backup-dialog="close"]':'[data-backup-dialog="confirm"]').focus();
  }
  function restoreFromText(text){
    const result=validateBackupText(text);
    if(!result.ok){showBackupError(result.error);return result;}
    showRestoreConfirm(result.backup);return result;
  }
  function confirmRestore(){
    if(!pendingRestore)return;
    applyRestore(pendingRestore);pendingRestore=null;dialog().close();
    if(state.drivetrain&&typeof syncReminderDrivetrain==='function'&&!reminderState.drivetrain)syncReminderDrivetrain(state.drivetrain);
    goTo('home');showToast(tr('backup.restored'));
  }
  function fileInput(){
    let input=document.getElementById('backupFileInput');
    if(!input){
      input=document.createElement('input');input.type='file';input.id='backupFileInput';input.hidden=true;
      // iOS blendet unbekannte Endungen aus, wenn accept zu eng ist. */* lässt .ojsicherung wählbar;
      // alte .json-Sicherungen bleiben ebenfalls wählbar. Geprüft wird danach nur der Inhalt.
      input.accept='.ojsicherung,.json,application/octet-stream,application/json,text/plain,*/*';
      input.addEventListener('change',()=>{
        const file=input.files&&input.files[0];input.value='';
        if(!file)return;
        if(file.size>BACKUP_MAX_BYTES){showBackupError('tooLarge');return;}
        const reader=new FileReader();
        reader.onload=()=>restoreFromText(String(reader.result||''));
        reader.onerror=()=>showBackupError('read');
        reader.readAsText(file,'utf-8');
      });
      document.body.appendChild(input);
    }
    return input;
  }
  function pickBackupFile(){fileInput().click();}
  function renderBackup(){
    app.innerHTML=`<section class="backup-page">
      <button type="button" class="route-back" data-action="back"><span aria-hidden="true">${currentLanguage==='ar'?'→':'←'}</span> ${tr('back')}</button>
      <p class="eyebrow">${tr('backup.eyebrow')}</p><h1>${tr('backup.title')}</h1><p class="page-intro">${tr('backup.intro')}</p>
      <p class="backup-tip"><span aria-hidden="true">✦</span> <strong>${tr('backup.tip')}</strong></p>
      <article class="backup-card"><h2>${tr('backup.saveHeading')}</h2><p>${tr('backup.saveText')}</p><p class="backup-last" id="backupLastInfo">${lastBackupText()}</p>
        <button type="button" class="button button-primary button-full" data-action="export-backup"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m-4-4 4 4 4-4"/><path d="M5 15v3a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3"/></svg> ${tr('backup.saveButton')}</button></article>
      <article class="backup-card"><h2>${tr('backup.restoreHeading')}</h2><p class="backup-restore-hint">${tr('backup.restoreHint')}</p><p>${tr('backup.restoreText')}</p>
        <button type="button" class="button button-secondary button-full" data-action="restore-backup"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21V10m-4 4 4-4 4 4"/><path d="M5 9V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3"/></svg> ${tr('backup.restoreButton')}</button></article>
      <section class="backup-includes"><h2>${tr('backup.includesTitle')}</h2><ul><li>${tr('backup.includesAnswers')}</li><li>${tr('backup.includesVehicle')}</li><li>${tr('backup.includesReminders')}</li></ul><p>${tr('backup.privacyNote')}</p></section>
    </section>`;
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-backup-dialog]');
    if(!button)return;
    event.preventDefault();
    if(button.dataset.backupDialog==='confirm')confirmRestore();
    else{pendingRestore=null;dialog().close();}
  });
  document.addEventListener('DOMContentLoaded',()=>{
    const box=dialog();
    if(box)box.addEventListener('click',event=>{if(event.target===event.currentTarget){pendingRestore=null;event.currentTarget.close();}});
  });
  fileInput();
  Object.assign(window,{renderBackup,exportBackup,pickBackupFile,validateBackupText,planRestore,restoreFromText,buildBackup,backupFileName});
})();
