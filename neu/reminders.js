const locale=()=>({de:'de-DE',en:'en-GB',tr:'tr-TR',ar:'ar-DE',pl:'pl-PL',ru:'ru-RU'}[currentLanguage]||'de-DE');
'use strict';
const REMINDER_KEY='oj-gebrauchtwagen-check.reminders.v1';
function createReminderState(){return {vehicleName:'',licensePlate:'',huMonth:'',tireSeason:'',tireDate:'',inspectionDate:'',currentMileage:null,inspectionMileage:null};}
let reminderState=createReminderState();
function normalizeReminders(raw){
  const out=createReminderState();
  if(!raw||typeof raw!=='object')return out;
  for(const key of ['vehicleName','licensePlate','huMonth','tireSeason','tireDate','inspectionDate'])if(typeof raw[key]==='string')out[key]=raw[key].slice(0,key==='vehicleName'?60:key==='licensePlate'?20:10);
  for(const key of ['currentMileage','inspectionMileage'])if(Number.isSafeInteger(raw[key])&&raw[key]>=0&&raw[key]<=9999999)out[key]=raw[key];
  return out;
}
function loadReminders(){try{reminderState=normalizeReminders(JSON.parse(localStorage.getItem(REMINDER_KEY)||'null'));}catch(_){reminderState=createReminderState();}}
function saveReminders(){try{localStorage.setItem(REMINDER_KEY,JSON.stringify(reminderState));}catch(_){showToast(tr('remindersStorageError'));}}
(() => {
  const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
  const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
  const SOON_DAYS = 56;
  function cleanText(value, maxLength) {return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';}
  function validDate(value) {
    if (!DATE_RE.test(value || '')) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }
  function localDate(value) {const [year, month, day] = value.split('-').map(Number);return new Date(year, month - 1, day);}
  function easterDate(year) {
    const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451);
    return new Date(year,Math.floor((h+l-7*m+114)/31)-1,(h+l-7*m+114)%31+1);
  }
  function shifted(value, days) {const date=new Date(value);date.setDate(date.getDate()+days);return date;}
  function isoDate(date) {return [date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');}
  function today() {const date=new Date();return isoDate(new Date(date.getFullYear(),date.getMonth(),date.getDate()));}
  function daysUntil(value) {return Math.round((localDate(value)-localDate(today()))/86400000);}
  function formatDate(value) {return localDate(value).toLocaleDateString(locale());}
  function dateStatus(key, value, kind) {
    const days=daysUntil(value);
    let text;
    if(days<0)text=tr('overdueDays',{n:Math.abs(days)});
    else if(days===0)text=key==='inspection'?tr('dueToday'):tr('today');
    else if(days===1)text=tr('oneDayLeft');
    else text=tr('daysLeft',{n:days});
    let level='green',badge=tr('inView');
    if(days<0){level='red';badge=tr('overdue');}
    else if(days<=SOON_DAYS){level='amber';badge=days<=14?tr('scheduleNow'):tr('dueSoon');}
    else if(kind==='tires')badge=tr('dateSet');
    return {key,kind:'date',date:value,days,level,badge,text};
  }
  function huBlock() {
    if(!reminderState.huMonth||!MONTH_RE.test(reminderState.huMonth))return [];
    const lastDay=new Date(Number(reminderState.huMonth.slice(0,4)),Number(reminderState.huMonth.slice(5,7)),0);
    const status=dateStatus('hu',isoDate(lastDay),'hu');
    status.endOfMonth=true;
    const [year,month]=reminderState.huMonth.split('-');
    status.dateLabel=`${month}/${year}`;
    status.text=status.days<0?tr('stickerMonthExpired'):status.text;
    if(status.days>=0&&new Date().getMonth()===lastDay.getMonth()&&new Date().getFullYear()===lastDay.getFullYear()){status.level='amber';status.badge=tr('stickerMonth');}
    return [status];
  }
  function suggestedTireDate(season) {
    const nextYear=localDate(today()).getFullYear()+1;
    return isoDate(season==='summer'?shifted(easterDate(nextYear),8):new Date(nextYear,9,15));
  }
  function reminderBlocks() {
    return [
      ...huBlock(),
      ...(['summer','winter'].includes(reminderState.tireSeason)&&validDate(reminderState.tireDate)?[dateStatus('tires',reminderState.tireDate,'tires')]:[]),
      ...(validDate(reminderState.inspectionDate)?[dateStatus('inspection',reminderState.inspectionDate,'inspection')]:[])
    ].sort((a,b)=>a.date.localeCompare(b.date));
  }
  function mileageStatus() {
    if(reminderState.inspectionMileage===null||reminderState.currentMileage===null)return null;
    const difference=reminderState.inspectionMileage-reminderState.currentMileage;
    let level='green',badge=tr('inView');
    if(difference<0){level='red';badge=tr('limitExceeded');}
    else if(difference<=1000){level='amber';badge=difference<=100?tr('scheduleWorkshop'):tr('dueSoon');}
    return {level,badge,difference,text:tr(difference<0?'mileageOver':'mileageLeft',{n:Math.abs(difference).toLocaleString(locale())})};
  }
  function tireLabel() {return reminderState.tireSeason==='summer'?tr('summerTires'):tr('winterTires');}
  function reminderForm() {
    return `<div class="reminder-page">
      <button type="button" class="route-back" data-action="reminders"><span aria-hidden="true">${currentLanguage==='ar'?'→':'←'}</span> ${tr('backToOverview')}</button>
      <p class="eyebrow">${tr('afterPurchase')}</p><h1>${tr('enterMyCar')}</h1><p class="page-intro">${tr('formIntro')}</p>
      <form id="reminderForm" class="reminder-form" novalidate>
        <fieldset><legend>${tr('yourVehicle')}</legend>
          <label for="vehicleName">${tr('vehicleName')} <span>${tr('optional')}</span></label><input id="vehicleName" name="vehicleName" value="${escapeHtml(reminderState.vehicleName)}" maxlength="60" placeholder="${tr('vehicleNameExample')}" autocomplete="off">
          <label for="licensePlate">${tr('licensePlate')} <span>${tr('optional')}</span></label><input id="licensePlate" name="licensePlate" value="${escapeHtml(reminderState.licensePlate)}" maxlength="20" placeholder="${tr('example',{value:'DO-AB 1234'})}" autocomplete="off">
        </fieldset>
        <fieldset><legend>${tr('inspectionLabel')}</legend><p class="form-help">${tr('huFormHelp')}</p>
          <label for="huMonth">${tr('nextInspection')}</label><input id="huMonth" name="huMonth" type="month" value="${escapeHtml(reminderState.huMonth)}">
          <p class="expert-inline"><strong>${tr('expertClassification')}</strong> ${tr('huExpertText')}</p>
        </fieldset>
        <fieldset><legend>${tr('tireChange')}</legend><p class="form-help">${tr('tireFormHelp')}</p>
          <label for="tireSeason">${tr('whichTires')}</label><select id="tireSeason" name="tireSeason"><option value="" ${!reminderState.tireSeason?'selected':''}>${tr('noTireReminder')}</option><option value="summer" ${reminderState.tireSeason==='summer'?'selected':''}>${tr('summerTireDefault')}</option><option value="winter" ${reminderState.tireSeason==='winter'?'selected':''}>${tr('winterTireDefault')}</option></select>
          <label for="tireDate">${tr('desiredTireDate')}</label><input id="tireDate" name="tireDate" type="date" value="${escapeHtml(reminderState.tireDate)}" ${!reminderState.tireSeason?'disabled':''}><p class="form-help">${tr('tireDateHelp')}</p>
        </fieldset>
        <fieldset><legend>${tr('serviceOil')}</legend><p class="form-help">${tr('serviceFormHelp')}</p>
          <label for="inspectionDate">${tr('nextDate')} <span>${tr('optional')}</span></label><input id="inspectionDate" name="inspectionDate" type="date" value="${escapeHtml(reminderState.inspectionDate)}">
          <label for="currentMileage">${tr('currentMileage')} <span>${tr('mileageCountdown')}</span></label><input id="currentMileage" name="currentMileage" type="number" inputmode="numeric" min="0" max="9999999" step="1" value="${reminderState.currentMileage??''}" placeholder="${tr('example',{value:'82500'})}">
          <label for="inspectionMileage">${tr('serviceByMileage')} <span>${tr('kmOptional')}</span></label><input id="inspectionMileage" name="inspectionMileage" type="number" inputmode="numeric" min="0" max="9999999" step="1" value="${reminderState.inspectionMileage??''}" placeholder="${tr('example',{value:'100000'})}">
        </fieldset>
        <label class="consent-check"><input type="checkbox" name="clearReminders"><span>${tr('clearCarDetails')}</span></label>
        <div id="reminderFormError" class="form-error" role="alert" tabindex="-1" hidden></div>
        <button class="button button-primary button-full" type="submit">${tr('saveDetails')} ${iconArrow()}</button>
        <button class="button button-secondary button-full" type="button" data-action="reminders">${tr('cancel')}</button>
      </form></div>`;
  }
  function overview() {
    const blocks=reminderBlocks(),mileage=mileageStatus(),title=reminderState.vehicleName||tr('yourVehicle');
    const details=[reminderState.licensePlate,reminderState.currentMileage!==null?tr('mileageCurrent',{n:reminderState.currentMileage.toLocaleString(locale())}):''].filter(Boolean).join(' · ');
    const findBlock=key=>blocks.find(block=>block.key===key);
    const hu=findBlock('hu'),tires=findBlock('tires'),inspection=findBlock('inspection');
    const calendarButton=key=>`<button class="button button-secondary button-full calendar-download" type="button" data-reminder-calendar="${key}">${tr('calendarButton')}</button>`;
    const card=(key,title,status)=>`<article class="reminder-card ${status.level}" data-reminder-status="${status.level}" data-reminder-key="${key}">
      <div class="reminder-card-top"><span class="reminder-symbol" aria-hidden="true">${key==='hu'?'HU':key==='tires'?'↻':'✓'}</span><span class="due-badge">${status.badge}</span></div>
      <h2>${title}</h2><p class="reminder-date">${status.dateLabel||formatDate(status.date)}${status.endOfMonth?' '+tr('untilEndMonth'):''}</p><p class="reminder-countdown">${status.text}</p>
      <p class="reminder-explanation">${tr(key==='hu'?'huCardHelp':key==='tires'?'tireCardHelp':'serviceCardHelp')}</p>${calendarButton(key)}</article>`;
    return `<section class="reminder-hero"><button type="button" class="route-back route-back-light" data-action="home"><span aria-hidden="true">${currentLanguage==='ar'?'→':'←'}</span> ${tr('backToStart')}</button><p class="eyebrow">${tr('afterPurchase')}</p><h1>${tr('myCarReminders')}</h1><p>${tr('reminderHeroText')}</p></section>
      <div class="reminder-body">
      <section class="vehicle-overview"><div><p class="eyebrow">${tr('vehicleOverview')}</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(details||tr('noVehicleDetails'))}</p></div><button class="button button-secondary" type="button" data-action="edit-reminders">${tr('edit')}</button></section>
      ${!blocks.length&&!mileage?`<div class="empty-reminders"><h2>${tr('noDates')}</h2><p>${tr('noDatesText')}</p><button class="button button-primary" type="button" data-action="edit-reminders">${tr('createFirstReminder')}</button></div>`:''}
      <div class="reminder-stats" aria-label="${tr('trafficLightLabel')}"><span class="green-dot"></span> ${tr('moreThanEightWeeks')} <span class="amber-dot"></span> ${tr('soon')} <span class="red-dot"></span> ${tr('overdue')}</div>
      <section class="reminders-list" aria-label="${tr('yourReminders')}">
        ${hu?card('hu',tr('inspectionLabel'),hu):''}${tires?card('tires',tr('tireChangeLabel',{tire:tireLabel()}),tires):''}${inspection?card('inspection',tr('serviceOil'),inspection):''}
        ${mileage?`<article class="reminder-card ${mileage.level}" data-reminder-status="${mileage.level}"><div class="reminder-card-top"><span class="reminder-symbol" aria-hidden="true">km</span><span class="due-badge">${mileage.badge}</span></div><h2>${tr('serviceByMileageTitle')}</h2><p class="reminder-date">${tr('mileageAt',{n:reminderState.inspectionMileage.toLocaleString(locale())})}</p><p class="reminder-countdown">${mileage.text}</p><p class="reminder-explanation">${tr('mileageCardHelp')}</p></article>`:''}
      </section>
      <p class="legal-note"><strong>${tr('important')}</strong> ${tr('calendarLegal')}</p>
      <aside class="oj-help-reminder"><p class="eyebrow">${tr('independentHelp')}</p><h2>${tr('accidentHelp')}</h2><p>${tr('accidentExpertHelp')}</p><button class="button button-primary button-full" type="button" data-action="contact">${tr('contactOJ')} ${iconArrow()}</button></aside></div>`;
  }
  function reminderData() {
    const name=reminderState.vehicleName||tr('myCar'),plate=reminderState.licensePlate?` (${reminderState.licensePlate})`:'';
    return [
      {key:'hu',valid:MONTH_RE.test(reminderState.huMonth)&&!!reminderState.huMonth&&validDate(huBlock()[0]?.date),date:huBlock()[0]?.date,title:`${tr('inspectionLabel')} – ${name}${plate}`,description:tr('calendarHuDescription')},
      {key:'tires',valid:['summer','winter'].includes(reminderState.tireSeason),date:reminderState.tireDate||suggestedTireDate(reminderState.tireSeason),title:`${tr('changeTireTitle',{tire:tireLabel()})} – ${name}${plate}`,description:tr('calendarTireDescription')},
      {key:'inspection',valid:validDate(reminderState.inspectionDate),date:reminderState.inspectionDate,title:`${tr('serviceOil')} – ${name}${plate}`,description:tr('calendarServiceDescription',{mileage:reminderState.inspectionMileage!==null?tr('calendarMileageLimit',{n:reminderState.inspectionMileage}):''})}
    ];
  }
  function icsEscape(value) {return String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
  function icsLine(line) {
    const utf8=new TextEncoder(),lines=[];
    let current='',byteLength=0;
    for(const character of Array.from(line)){
      const size=utf8.encode(character).length;
      // RFC 5545: the space introducing each physical continuation line is part of its 75-octet limit.
      if(byteLength+size+(!lines.length?0:1)>75){lines.push(current);current=character;byteLength=size+1;}
      else{current+=character;byteLength+=size;}
    }
    lines.push(current);return lines.length>1?lines[0]+'\r\n '+lines.slice(1).join('\r\n '):lines[0];
  }
  function compactDate(value) {return value.replace(/-/g,'');}
  function stampedDate(date) {return date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');}
  function createCalendar(item) {
    if(!item||!validDate(item.date))throw new Error(tr('calendarMissing'));
    const alarmDate=isoDate(shifted(localDate(item.date),-28));
    const lines=[
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//OJ Gutachter//Gebrauchtwagen Check//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:'+tr('calendarName'),
      'BEGIN:VEVENT',`UID:${item.key}-${compactDate(item.date)}@oj-gebrauchtwagen-check.local`,`DTSTAMP:${stampedDate(new Date())}`,`DTSTART;VALUE=DATE:${compactDate(item.date)}`,`DTEND;VALUE=DATE:${compactDate(isoDate(shifted(localDate(item.date),1)))}`,
      icsLine(`SUMMARY:${icsEscape(item.title)}`),icsLine(`DESCRIPTION:${icsEscape(item.description)}`),'STATUS:CONFIRMED','TRANSP:TRANSPARENT',
      'BEGIN:VALARM','ACTION:DISPLAY',icsLine(`DESCRIPTION:${icsEscape(tr('calendarAlarmPrefix')+item.title)}`),icsLine(`TRIGGER;VALUE=DATE-TIME:${compactDate(alarmDate)}T080000`),'END:VALARM','END:VEVENT','END:VCALENDAR'
    ];
    return lines.join('\r\n')+'\r\n';
  }
  function downloadCalendar(key) {
    const item=reminderData().find(entry=>entry.key===key);
    if(!item||!item.valid||!item.date){showToast(tr('saveValidDateFirst'));return;}
    const ics=createCalendar(item),utf8Bytes=new TextEncoder().encode(ics),blob=new Blob([new Uint8Array([0xEF,0xBB,0xBF]),utf8Bytes],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
    anchor.href=url;anchor.download=`OJ-${key}-${item.date}.ics`;document.body.appendChild(anchor);anchor.click();anchor.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1500);
    window.__lastReminderCalendar={key,content:ics};
    showToast(tr('calendarCreated'));
  }
  function numberValue(value) {if(value==='')return null;const number=Number(value);return Number.isSafeInteger(number)&&number>=0&&number<=9999999?number:undefined;}
  function submitReminderForm(form) {
    const data=new FormData(form),vehicleName=cleanText(data.get('vehicleName'),60),licensePlate=cleanText(data.get('licensePlate'),20),huMonth=data.get('huMonth'),tireSeason=data.get('tireSeason'),tireDate=data.get('tireDate'),inspectionDate=data.get('inspectionDate'),currentMileage=numberValue(data.get('currentMileage')),inspectionMileage=numberValue(data.get('inspectionMileage'));
    let error='';
    if(huMonth&&!MONTH_RE.test(huMonth))error=tr('checkHuMonth');
    else if(tireSeason&&!['summer','winter'].includes(tireSeason))error=tr('chooseTireType');
    else if(tireSeason&&!validDate(tireDate))error=tr('validTireDate');
    else if(inspectionDate&&!validDate(inspectionDate))error=tr('checkServiceDate');
    else if([currentMileage,inspectionMileage].includes(undefined))error=tr('mileageNumber');
    else if(inspectionMileage!==null&&currentMileage===null)error=tr('currentMileageRequired');
    if(error){const box=document.getElementById('reminderFormError');box.textContent=error;box.hidden=false;box.focus();return;}
    if(data.get('clearReminders'))reminderState=createReminderState();
    else reminderState={vehicleName,licensePlate,huMonth,tireSeason:tireSeason||'',tireDate:tireSeason?tireDate:'',inspectionDate,currentMileage,inspectionMileage};
    saveReminders();goTo('reminders');showToast(data.get('clearReminders')?tr('carRemindersDeleted'):tr('detailsSaved'));
  }
  function updateSuggestedTireDate(form,overwrite) {const season=form.elements.tireSeason.value,dateInput=form.elements.tireDate;dateInput.disabled=!season;if(overwrite)dateInput.value=season?suggestedTireDate(season):'';}
  document.addEventListener('submit',event=>{if(event.target.id==='reminderForm'){event.preventDefault();submitReminderForm(event.target);}});
  document.addEventListener('change',event=>{
    if(event.target.name==='clearReminders'){
      const fields=document.querySelectorAll('#reminderForm input:not([name="clearReminders"]), #reminderForm select');
      fields.forEach(field=>{field.disabled=event.target.checked;});
      if(!event.target.checked)updateSuggestedTireDate(document.getElementById('reminderForm'),false);
    }
    if(event.target.id==='tireSeason')updateSuggestedTireDate(event.target.form,true);
  });
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-reminder-calendar]');
    if(button){event.preventDefault();downloadCalendar(button.dataset.reminderCalendar);
    }
  });
  Object.assign(window,{renderReminderForm(){app.innerHTML=reminderForm();},renderReminders(){app.innerHTML=overview();},createCalendar,createReminderCalendar:createCalendar,reminderData,reminderBlocks});
})();

if(typeof window.startOjCheck==='function')window.startOjCheck();
