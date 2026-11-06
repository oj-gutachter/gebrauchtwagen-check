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
function saveReminders(){try{localStorage.setItem(REMINDER_KEY,JSON.stringify(reminderState));}catch(_){showToast('Termine konnten nicht dauerhaft gespeichert werden.');}}
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
  function formatDate(value) {return localDate(value).toLocaleDateString('de-DE');}
  function dateStatus(key, value, kind) {
    const days=daysUntil(value);
    let text;
    if(days<0)text=`Seit ${Math.abs(days)} ${Math.abs(days)===1?'Tag':'Tagen'} überfällig`;
    else if(days===0)text=key==='inspection'?'Heute fällig':'Heute';
    else if(days===1)text='Noch 1 Tag';
    else text=`Noch ${days} Tage`;
    let level='green',badge='Im Blick';
    if(days<0){level='red';badge='Überfällig';}
    else if(days<=SOON_DAYS){level='amber';badge=days<=14?'Jetzt einplanen':'Fällig bald';}
    else if(kind==='tires')badge='Termin gesetzt';
    return {key,kind:'date',date:value,days,level,badge,text};
  }
  function huBlock() {
    if(!MONTH_RE.test(reminderState.huMonth))return [];
    const lastDay=new Date(Number(reminderState.huMonth.slice(0,4)),Number(reminderState.huMonth.slice(5,7)),0);
    const status=dateStatus('hu',isoDate(lastDay),'hu');
    status.endOfMonth=true;
    const [year,month]=reminderState.huMonth.split('-');
    status.dateLabel=`${month}/${year}`;
    status.text=status.days<0?'Plakettenmonat abgelaufen':status.text;
    if(status.days>=0&&new Date().getMonth()===lastDay.getMonth()&&new Date().getFullYear()===lastDay.getFullYear()){status.level='amber';status.badge='Plakettenmonat';}
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
    let level='green',badge='Im Blick';
    if(difference<0){level='red';badge='Grenze überschritten';}
    else if(difference<=1000){level='amber';badge=difference<=100?'Werkstatt einplanen':'Fällig bald';}
    return {level,badge,difference,text:difference<0?`${Math.abs(difference).toLocaleString('de-DE')} km über dem eingetragenen Wert`:`Noch ${difference.toLocaleString('de-DE')} km`};
  }
  function tireLabel() {return reminderState.tireSeason==='summer'?'Sommerreifen':'Winterreifen';}
  function reminderForm() {
    return `<div class="reminder-page">
      <button type="button" class="route-back" data-action="reminders">← Zurück zur Übersicht</button>
      <p class="eyebrow">Nach dem Autokauf</p><h1>Mein Auto eintragen</h1><p class="page-intro">Nur die gewünschten Angaben ausfüllen. Alle Daten bleiben auf diesem Gerät.</p>
      <form id="reminderForm" class="reminder-form" novalidate>
        <fieldset><legend>Ihr Fahrzeug</legend>
          <label for="vehicleName">Fahrzeugname <span>optional</span></label><input id="vehicleName" name="vehicleName" value="${escapeHtml(reminderState.vehicleName)}" maxlength="60" placeholder="z. B. Familienauto" autocomplete="off">
          <label for="licensePlate">Kennzeichen <span>optional</span></label><input id="licensePlate" name="licensePlate" value="${escapeHtml(reminderState.licensePlate)}" maxlength="20" placeholder="z. B. DO-AB 1234" autocomplete="off">
        </fieldset>
        <fieldset><legend>TÜV / HU</legend><p class="form-help">Monat und Jahr von der Plakette oder dem Prüfbericht übernehmen. Der Monat zählt bis zum Monatsende.</p>
          <label for="huMonth">Nächste Hauptuntersuchung</label><input id="huMonth" name="huMonth" type="month" value="${escapeHtml(reminderState.huMonth)}">
          <p class="expert-inline"><strong>Fachlich eingeordnet:</strong> Pkw benötigen die HU in der Regel alle 24 Monate. Bei Neuwagen ist die erste HU nach 36 Monaten fällig. Der offizielle Prüfbericht und die Plakette sind maßgeblich.</p>
        </fieldset>
        <fieldset><legend>Reifenwechsel</legend><p class="form-help">Die Jahreszeit ist eine Orientierung. Wetterlage und tatsächliche Bedingungen sind entscheidend; es gibt keine starren Deutschlandtermine für alle Pkw.</p>
          <label for="tireSeason">Welche Reifen sollen montiert werden?</label><select id="tireSeason" name="tireSeason"><option value="" ${!reminderState.tireSeason?'selected':''}>Keine Reifen-Erinnerung</option><option value="summer" ${reminderState.tireSeason==='summer'?'selected':''}>Sommerreifen – Standard: eine Woche nach Ostersonntag</option><option value="winter" ${reminderState.tireSeason==='winter'?'selected':''}>Winterreifen – Standard: 15. Oktober</option></select>
          <label for="tireDate">Gewünschter Reifen-Termin</label><input id="tireDate" name="tireDate" type="date" value="${escapeHtml(reminderState.tireDate)}" ${!reminderState.tireSeason?'disabled':''}><p class="form-help">O bis O: von Oktober bis Ostern als Merkhilfe. Den Termin können Sie selbst ändern.</p>
        </fieldset>
        <fieldset><legend>Inspektion / Ölwechsel</legend><p class="form-help">Datum und Kilometergrenze können einzeln oder gemeinsam eingetragen werden. Herstellerangaben im Serviceplan haben Vorrang.</p>
          <label for="inspectionDate">Nächster Termin <span>optional</span></label><input id="inspectionDate" name="inspectionDate" type="date" value="${escapeHtml(reminderState.inspectionDate)}">
          <label for="currentMileage">Aktueller Kilometerstand <span>für den km-Countdown</span></label><input id="currentMileage" name="currentMileage" type="number" inputmode="numeric" min="0" max="9999999" step="1" value="${reminderState.currentMileage??''}" placeholder="z. B. 82500">
          <label for="inspectionMileage">Inspektion spätestens bei <span>km, optional</span></label><input id="inspectionMileage" name="inspectionMileage" type="number" inputmode="numeric" min="0" max="9999999" step="1" value="${reminderState.inspectionMileage??''}" placeholder="z. B. 100000">
        </fieldset>
        <label class="consent-check"><input type="checkbox" name="clearReminders"><span>Alle Angaben zu „Mein Auto“ löschen. Die Kauf-Checkliste bleibt erhalten.</span></label>
        <div id="reminderFormError" class="form-error" role="alert" tabindex="-1" hidden></div>
        <button class="button button-primary button-full" type="submit">Angaben speichern ${iconArrow()}</button>
        <button class="button button-secondary button-full" type="button" data-action="reminders">Abbrechen</button>
      </form></div>`;
  }
  function overview() {
    const blocks=reminderBlocks(),mileage=mileageStatus(),title=reminderState.vehicleName||'Ihr Fahrzeug';
    const details=[reminderState.licensePlate,reminderState.currentMileage!==null?`${reminderState.currentMileage.toLocaleString('de-DE')} km aktuell`:''].filter(Boolean).join(' · ');
    const findBlock=key=>blocks.find(block=>block.key===key);
    const hu=findBlock('hu'),tires=findBlock('tires'),inspection=findBlock('inspection');
    const calendarButton=key=>`<button class="button button-secondary button-full calendar-download" type="button" data-reminder-calendar="${key}">In Kalender übernehmen · Alarm 4 Wochen vorher</button>`;
    const card=(key,title,status)=>`<article class="reminder-card ${status.level}" data-reminder-status="${status.level}" data-reminder-key="${key}">
      <div class="reminder-card-top"><span class="reminder-symbol" aria-hidden="true">${key==='hu'?'HU':key==='tires'?'↻':'✓'}</span><span class="due-badge">${status.badge}</span></div>
      <h2>${title}</h2><p class="reminder-date">${status.dateLabel||formatDate(status.date)}${status.endOfMonth?' · bis Monatsende':''}</p><p class="reminder-countdown">${status.text}</p>
      <p class="reminder-explanation">${key==='hu'?'Die HU-Ansicht richtet sich nach dem Plakettenmonat, nicht nach einem einzelnen Tag.':key==='tires'?'Der Termin ist ein frei wählbarer Vorschlag. Reifen passend zu Wetter und Fahrbedingungen wechseln.':'Herstellerangaben und Wartungsplan Ihres Fahrzeugs sind maßgeblich.'}</p>${calendarButton(key)}</article>`;
    return `<section class="reminder-hero"><button type="button" class="route-back route-back-light" data-action="home">← Zur Startseite</button><p class="eyebrow">Nach dem Autokauf</p><h1>Mein Auto – Erinnerungen</h1><p>Wichtige Fahrzeugtermine im Blick. Ohne Konto und ohne dass Daten das Gerät verlassen.</p></section>
      <div class="reminder-body">
      <section class="vehicle-overview"><div><p class="eyebrow">Ihre Fahrzeugübersicht</p><h2>${escapeHtml(title)}</h2><p>${escapeHtml(details||'Noch kein Name oder Kennzeichen eingetragen.')}</p></div><button class="button button-secondary" type="button" data-action="edit-reminders">Bearbeiten</button></section>
      ${!blocks.length&&!mileage?'<div class="empty-reminders"><h2>Noch keine Termine eingetragen</h2><p>Legen Sie TÜV, Reifenwechsel oder Inspektion an. Danach sehen Sie hier den Countdown und die Ampel.</p><button class="button button-primary" type="button" data-action="edit-reminders">Erste Erinnerung anlegen</button></div>':''}
      <div class="reminder-stats" aria-label="Ampel und Fristen"><span class="green-dot"></span> Mehr als 8 Wochen <span class="amber-dot"></span> Bald <span class="red-dot"></span> Überfällig</div>
      <section class="reminders-list" aria-label="Ihre Erinnerungen">
        ${hu?card('hu','TÜV / HU',hu):''}${tires?card('tires',`Reifenwechsel · ${tireLabel()}`,tires):''}${inspection?card('inspection','Inspektion / Ölwechsel',inspection):''}
        ${mileage?`<article class="reminder-card ${mileage.level}" data-reminder-status="${mileage.level}"><div class="reminder-card-top"><span class="reminder-symbol" aria-hidden="true">km</span><span class="due-badge">${mileage.badge}</span></div><h2>Inspektion nach Kilometerstand</h2><p class="reminder-date">Bei ${reminderState.inspectionMileage.toLocaleString('de-DE')} km</p><p class="reminder-countdown">${mileage.text}</p><p class="reminder-explanation">Der km-Wert ändert sich nicht selbst. Tragen Sie den aktuellen Tachostand nach, wenn Sie ihn aktualisieren möchten.</p></article>`:''}
      </section>
      <p class="legal-note"><strong>Wichtig:</strong> Die Übersicht erscheint beim Öffnen der App. Eine .ics-Datei kann in Apple Kalender und viele andere Kalender-Apps importiert werden. Prüfen Sie den importierten Termin und den Alarm dort. Fristen und Serviceintervalle bitte zusätzlich anhand der Fahrzeugpapiere und Herstellerangaben prüfen.</p>
      <aside class="oj-help-reminder"><p class="eyebrow">Unabhängige Hilfe</p><h2>Unfall oder Schaden? OJ hilft</h2><p>Lassen Sie einen Unfallschaden unabhängig einschätzen.</p><button class="button button-primary button-full" type="button" data-action="contact">Kontakt zu OJ ${iconArrow()}</button></aside></div>`;
  }
  function reminderData() {
    const name=reminderState.vehicleName||'Mein Auto',plate=reminderState.licensePlate?` (${reminderState.licensePlate})`:'';
    return [
      {key:'hu',valid:MONTH_RE.test(reminderState.huMonth),date:huBlock()[0]?.date,title:`TÜV / HU – ${name}${plate}`,description:'Hauptuntersuchung: Termin bis zum Ende des Plakettenmonats vereinbaren. Prüfbericht und Fahrzeugpapiere bereithalten.'},
      {key:'tires',valid:['summer','winter'].includes(reminderState.tireSeason)&&validDate(reminderState.tireDate),date:reminderState.tireDate,title:`${tireLabel()} wechseln – ${name}${plate}`,description:'Reifenwechsel nach eigener Terminwahl; Wetter und Fahrbedingungen beachten.'},
      {key:'inspection',valid:validDate(reminderState.inspectionDate),date:reminderState.inspectionDate,title:`Inspektion / Ölwechsel – ${name}${plate}`,description:`Wartungstermin. Herstellerangaben beachten.${reminderState.inspectionMileage!==null?` Eingetragene Kilometergrenze: ${reminderState.inspectionMileage} km.`:''}`}
    ];
  }
  function icsEscape(value) {return String(value).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
  function icsLine(line) {
    const utf8=new TextEncoder(),lines=[];
    let current='',byteLength=0;
    for(const character of Array.from(line)){
      const size=utf8.encode(character).length;
      if(byteLength+size>75){lines.push(current);current=character;byteLength=size;}
      else{current+=character;byteLength+=size;}
    }
    lines.push(current);return lines.join('\r\n ');
  }
  function compactDate(value) {return value.replace(/-/g,'');}
  function stampedDate(date) {return date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');}
  function createCalendar(item) {
    if(!item||!validDate(item.date))throw new Error('Kalendertermin fehlt oder ist ungültig.');
    const alarmDate=isoDate(shifted(localDate(item.date),-28));
    const lines=[
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//OJ Gutachter//Gebrauchtwagen Check//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:OJ Auto-Erinnerungen',
      'BEGIN:VEVENT',`UID:${item.key}-${compactDate(item.date)}@oj-gebrauchtwagen-check.local`,`DTSTAMP:${stampedDate(new Date())}`,`DTSTART;VALUE=DATE:${compactDate(item.date)}`,`DTEND;VALUE=DATE:${compactDate(isoDate(shifted(localDate(item.date),1)))}`,
      icsLine(`SUMMARY:${icsEscape(item.title)}`),icsLine(`DESCRIPTION:${icsEscape(item.description)}`),'STATUS:CONFIRMED','TRANSP:TRANSPARENT',
      'BEGIN:VALARM','ACTION:DISPLAY',icsLine(`DESCRIPTION:${icsEscape('OJ Auto-Erinnerung: '+item.title)}`),icsLine(`TRIGGER;VALUE=DATE-TIME:${compactDate(alarmDate)}T080000`),'END:VALARM','END:VEVENT','END:VCALENDAR'
    ];
    return lines.join('\r\n')+'\r\n';
  }
  function downloadCalendar(key) {
    const item=reminderData().find(entry=>entry.key===key);
    if(!item||!item.valid||!item.date){showToast('Bitte zuerst einen gültigen Termin speichern.');return;}
    const ics=createCalendar(item),utf8Bytes=new TextEncoder().encode(ics),blob=new Blob([new Uint8Array([0xEF,0xBB,0xBF]),utf8Bytes],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
    anchor.href=url;anchor.download=`OJ-${key}-${item.date}.ics`;document.body.appendChild(anchor);anchor.click();anchor.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),1500);
    window.__lastReminderCalendar={key,content:ics};
    showToast('Kalenderdatei erstellt. Bitte in Ihrer Kalender-App importieren und prüfen.');
  }
  function numberValue(value) {if(value==='')return null;const number=Number(value);return Number.isSafeInteger(number)&&number>=0&&number<=9999999?number:undefined;}
  function submitReminderForm(form) {
    const data=new FormData(form),vehicleName=cleanText(data.get('vehicleName'),60),licensePlate=cleanText(data.get('licensePlate'),20),huMonth=data.get('huMonth'),tireSeason=data.get('tireSeason'),tireDate=data.get('tireDate'),inspectionDate=data.get('inspectionDate'),currentMileage=numberValue(data.get('currentMileage')),inspectionMileage=numberValue(data.get('inspectionMileage'));
    let error='';
    if(huMonth&&!MONTH_RE.test(huMonth))error='Bitte TÜV-Monat und Jahr prüfen.';
    else if(tireSeason&&!['summer','winter'].includes(tireSeason))error='Bitte eine Reifenart wählen.';
    else if(tireSeason&&!validDate(tireDate))error='Bitte für den Reifenwechsel ein gültiges Datum eingeben.';
    else if(inspectionDate&&!validDate(inspectionDate))error='Bitte das Inspektionsdatum prüfen.';
    else if([currentMileage,inspectionMileage].includes(undefined))error='Kilometerstände nur als ganze Zahl zwischen 0 und 9.999.999 eingeben.';
    else if(inspectionMileage!==null&&currentMileage===null)error='Bitte zusätzlich den aktuellen Kilometerstand für den km-Countdown eintragen.';
    if(error){const box=document.getElementById('reminderFormError');box.textContent=error;box.hidden=false;box.focus();return;}
    if(data.get('clearReminders'))reminderState=createReminderState();
    else reminderState={vehicleName,licensePlate,huMonth,tireSeason:tireSeason||'',tireDate:tireSeason?tireDate:'',inspectionDate,currentMileage,inspectionMileage};
    saveReminders();goTo('reminders');showToast(data.get('clearReminders')?'Die Auto-Erinnerungen wurden gelöscht.':'Die Angaben sind lokal auf diesem Gerät gespeichert.');
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
  Object.assign(window,{renderReminderForm(){app.innerHTML=reminderForm();},renderReminders(){app.innerHTML=overview();},createReminderCalendar:createCalendar,reminderData,reminderBlocks});
})();

if(typeof window.startOjCheck==='function')window.startOjCheck();
