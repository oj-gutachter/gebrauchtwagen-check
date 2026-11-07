const locale=()=>({de:'de-DE',en:'en-GB',tr:'tr-TR',ar:'ar-DE',pl:'pl-PL',ru:'ru-RU'}[currentLanguage]||'de-DE');
'use strict';
const REMINDER_KEY='oj-gebrauchtwagen-check.reminders.v1';
function createReminderState(){return {vehicleName:'',licensePlate:'',drivetrain:null,huMonth:'',tireSeason:'',tireDate:'',inspectionDate:'',currentMileage:null,inspectionMileage:null};}
let reminderState=createReminderState();
function normalizeReminders(raw){
  const out=createReminderState();
  if(!raw||typeof raw!=='object')return out;
  if(typeof DRIVE_TYPES!=='undefined'&&DRIVE_TYPES.includes(raw.drivetrain))out.drivetrain=raw.drivetrain;
  for(const key of ['vehicleName','licensePlate','huMonth','tireSeason','tireDate','inspectionDate'])if(typeof raw[key]==='string')out[key]=raw[key].slice(0,key==='vehicleName'?60:key==='licensePlate'?20:10);
  for(const key of ['currentMileage','inspectionMileage'])if(Number.isSafeInteger(raw[key])&&raw[key]>=0&&raw[key]<=9999999)out[key]=raw[key];
  return out;
}
function loadReminders(){try{reminderState=normalizeReminders(JSON.parse(localStorage.getItem(REMINDER_KEY)||'null'));}catch(_){reminderState=createReminderState();}}
function saveReminders(){try{localStorage.setItem(REMINDER_KEY,JSON.stringify(reminderState));}catch(_){showToast(tr('remindersStorageError'));}}
function syncReminderDrivetrain(drive){if(!DRIVE_TYPES.includes(drive))return;reminderState.drivetrain=drive;saveReminders();}
function isElectricReminder(){return (reminderState.drivetrain||state.drivetrain)==='electric';}
function serviceLabel(){return tr(isElectricReminder()?'serviceElectric':'serviceOil');}
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
        <fieldset><legend>${serviceLabel()}</legend><p class="form-help">${tr(isElectricReminder()?'serviceElectricFormHelp':'serviceFormHelp')}</p>
          <label for="inspectionDate">${tr('nextDate')} <span>${tr('optional')}</span></label><input id="inspectionDate" name="inspectionDate" type="date" value="${escapeHtml(reminderState.inspectionDate)}">
          <label for="currentMileage">${tr('currentMileage')} <span>${tr('mileageCountdown')}</span></label><input id="currentMileage" name="currentMileage" type="number" inputmode="numeric" min="0" max="9999999" step="1" value="${reminderState.currentMileage??''}" placeholder="${tr('example',{value:'82500'})}">
          <label for="inspectionMileage">${tr(isElectricReminder()?'serviceElectricByMileage':'serviceByMileage')} <span>${tr('kmOptional')}</span></label><input id="inspectionMileage" name="inspectionMileage" type="number" inputmode="numeric" min="0" max="9999999" step="1" value="${reminderState.inspectionMileage??''}" placeholder="${tr('example',{value:'100000'})}">
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
    const calendarButton=key=>typeof calendarControlsHtml==='function'?calendarControlsHtml(key,'reminder'):`<button class="button button-secondary button-full calendar-download" type="button" data-reminder-calendar="${key}">${tr('calendarButton')}</button>`;
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
        ${hu?card('hu',tr('inspectionLabel'),hu):''}${tires?card('tires',tr('tireChangeLabel',{tire:tireLabel()}),tires):''}${inspection?card('inspection',serviceLabel(),inspection):''}
        ${mileage?`<article class="reminder-card ${mileage.level}" data-reminder-status="${mileage.level}"><div class="reminder-card-top"><span class="reminder-symbol" aria-hidden="true">km</span><span class="due-badge">${mileage.badge}</span></div><h2>${tr(isElectricReminder()?'serviceElectricByMileageTitle':'serviceByMileageTitle')}</h2><p class="reminder-date">${tr('mileageAt',{n:reminderState.inspectionMileage.toLocaleString(locale())})}</p><p class="reminder-countdown">${mileage.text}</p><p class="reminder-explanation">${tr('mileageCardHelp')}</p></article>`:''}
      </section>
      <p class="legal-note"><strong>${tr('important')}</strong> ${tr('calendarLegal')}</p>
      <aside class="backup-hint-card"><p><strong>${tr('backup.tip')}</strong></p><button class="button button-secondary button-full" type="button" data-action="backup">${tr('backup.open')} ${iconArrow()}</button></aside>
      <aside class="oj-help-reminder"><p class="eyebrow">${tr('independentHelp')}</p><h2>${tr('accidentHelp')}</h2><p>${tr('accidentExpertHelp')}</p><button class="button button-primary button-full" type="button" data-action="contact">${tr('contactOJ')} ${iconArrow()}</button></aside></div>`;
  }
  function reminderData() {
    const name=reminderState.vehicleName||tr('myCar'),plate=reminderState.licensePlate?` (${reminderState.licensePlate})`:'';
    return [
      {key:'hu',valid:MONTH_RE.test(reminderState.huMonth)&&!!reminderState.huMonth&&validDate(huBlock()[0]?.date),date:huBlock()[0]?.date,title:`${tr('inspectionLabel')} – ${name}${plate}`,description:tr('calendarHuDescription')},
      {key:'tires',valid:['summer','winter'].includes(reminderState.tireSeason),date:reminderState.tireDate||suggestedTireDate(reminderState.tireSeason),title:`${tr('changeTireTitle',{tire:tireLabel()})} – ${name}${plate}`,description:tr('calendarTireDescription')},
      {key:'inspection',valid:validDate(reminderState.inspectionDate),date:reminderState.inspectionDate,title:`${serviceLabel()} – ${name}${plate}`,description:tr('calendarServiceDescription',{mileage:reminderState.inspectionMileage!==null?tr('calendarMileageLimit',{n:reminderState.inspectionMileage}):''})}
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
  const APP_BRAND='OJ Gebrauchtwagen-Check';
  function compactTime(value) {return value.replace(':','')+'00';}
  // RFC 5545: Alarme relativ zum Beginn. Ganztägig: "-PT15H" = Vortag 09:00 Uhr Ortszeit.
  function defaultAlarms(item) {return item.time?['-P1D','-PT2H']:['-P27DT15H','-PT15H'];}
  function createCalendar(item) {
    if(!item||!validDate(item.date))throw new Error(tr('calendarMissing'));
    const timed=typeof item.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time);
    const title=String(item.title).includes(APP_BRAND)?String(item.title):`${item.title} · ${APP_BRAND}`;
    const description=`${item.description}\n\n${APP_BRAND} · OJ Gutachter`;
    let start,end;
    if(timed){
      const startDate=new Date(...item.date.split('-').map((v,i)=>i===1?Number(v)-1:Number(v)),...item.time.split(':').map(Number));
      const endDate=new Date(startDate.getTime()+60*60000);
      start=`DTSTART:${compactDate(item.date)}T${compactTime(item.time)}`;
      end=`DTEND:${compactDate(isoDate(endDate))}T${String(endDate.getHours()).padStart(2,'0')}${String(endDate.getMinutes()).padStart(2,'0')}00`;
    }else{
      start=`DTSTART;VALUE=DATE:${compactDate(item.date)}`;
      end=`DTEND;VALUE=DATE:${compactDate(isoDate(shifted(localDate(item.date),1)))}`;
    }
    const alarmPrefix=typeof item.alarmPrefix==='string'&&item.alarmPrefix?item.alarmPrefix:tr('calendarAlarmPrefix');
    const calendarName=typeof item.calendarName==='string'&&item.calendarName?item.calendarName:tr('calendarName');
    const alarms=(item.alarms||defaultAlarms({time:timed?item.time:''})).flatMap(trigger=>['BEGIN:VALARM','ACTION:DISPLAY',icsLine(`DESCRIPTION:${icsEscape(alarmPrefix+item.title)}`),`TRIGGER:${trigger}`,'END:VALARM']);
    const lines=[
      'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//OJ Gutachter//Gebrauchtwagen Check//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH',icsLine('X-WR-CALNAME:'+icsEscape(calendarName)),
      'BEGIN:VEVENT',`UID:${item.key}-${compactDate(item.date)}${timed?'T'+compactTime(item.time):''}@oj-gebrauchtwagen-check.local`,`DTSTAMP:${stampedDate(new Date())}`,start,end,
      icsLine(`SUMMARY:${icsEscape(title)}`),icsLine(`DESCRIPTION:${icsEscape(description)}`),'STATUS:CONFIRMED',`TRANSP:${timed?'OPAQUE':'TRANSPARENT'}`,
      ...alarms,'END:VEVENT','END:VCALENDAR'
    ];
    return lines.join('\r\n')+'\r\n';
  }
  const CALENDAR_HASH_PREFIX='ojcal.';
  const CALENDAR_KEYS=['besichtigung','hu','tires','inspection'];
  const CALENDAR_LIMITS={title:240,description:1200,alarmPrefix:80,calendarName:80};
  // CriOS/FxiOS/EdgiOS und In-App-Browser. Deren User-Agent enthält oft zusätzlich „Safari“.
  const IOS_OTHER_RE=/CriOS|FxiOS|EdgiOS|OPiOS|OPT\/|DuckDuckGo|YaBrowser|Instagram|WhatsApp|FBAN|FBAV|FB_IAB|FB4A|Messenger|Line\/|Twitter|Snapchat|TikTok|Bytedance|LinkedInApp|Pinterest|GSA\/|MicroMessenger|GNews/i;
  function calendarPlatform(ua,options={}){
    const text=String(ua||'');
    const touchMac=(options.maxTouchPoints>1)&&/Macintosh/.test(text);
    const ios=/iPhone|iPad|iPod/.test(text)||touchMac;
    if(ios)return IOS_OTHER_RE.test(text)?'ios-other':'ios-safari';
    if(/Android/i.test(text))return 'android';
    return 'desktop';
  }
  function currentCalendarPlatform(){return calendarPlatform(navigator.userAgent,{maxTouchPoints:navigator.maxTouchPoints||0});}
  function iosMajorVersion(ua){
    const match=String(ua||'').match(/(?:CPU iPhone OS|CPU OS|iPhone OS) (\d+)[_.]/);
    return match?Number(match[1]):null;
  }
  function bytesToBase64Url(bytes){
    let binary='';
    for(const byte of bytes)binary+=String.fromCharCode(byte);
    return btoa(binary).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  }
  function base64UrlToBytes(value){
    const text=String(value||'').replace(/-/g,'+').replace(/_/g,'/');
    const padded=text+'='.repeat((4-text.length%4)%4);
    const binary=atob(padded);
    const bytes=new Uint8Array(binary.length);
    for(let index=0;index<binary.length;index++)bytes[index]=binary.charCodeAt(index);
    return bytes;
  }
  function calendarPayload(item){
    const clip=(value,max)=>String(value||'').slice(0,max);
    return {v:1,key:String(item.key||''),date:item.date,time:item.time||'',title:clip(item.title,CALENDAR_LIMITS.title),description:clip(item.description,CALENDAR_LIMITS.description),alarmPrefix:clip(item.alarmPrefix||tr('calendarAlarmPrefix'),CALENDAR_LIMITS.alarmPrefix),calendarName:clip(item.calendarName||tr('calendarName'),CALENDAR_LIMITS.calendarName)};
  }
  function encodeCalendarHash(item){
    const json=JSON.stringify(calendarPayload(item));
    return CALENDAR_HASH_PREFIX+bytesToBase64Url(new TextEncoder().encode(json));
  }
  function decodeCalendarHash(hash){
    const raw=String(hash||'').replace(/^#/,'');
    if(!raw.startsWith(CALENDAR_HASH_PREFIX)||raw.length>12000)return null;
    let data;
    try{data=JSON.parse(new TextDecoder().decode(base64UrlToBytes(raw.slice(CALENDAR_HASH_PREFIX.length))));}
    catch(_){return null;}
    if(!data||data.v!==1||!CALENDAR_KEYS.includes(data.key)||!validDate(data.date))return null;
    if(data.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time))return null;
    const clip=(value,max)=>typeof value==='string'?value.slice(0,max):'';
    const title=clip(data.title,CALENDAR_LIMITS.title);
    if(!title)return null;
    return {key:data.key,date:data.date,time:data.time||'',title,description:clip(data.description,CALENDAR_LIMITS.description),alarmPrefix:clip(data.alarmPrefix,CALENDAR_LIMITS.alarmPrefix),calendarName:clip(data.calendarName,CALENDAR_LIMITS.calendarName),valid:true};
  }
  function consumeCalendarFragment(){
    const raw=location.hash.replace(/^#/,'');
    if(!raw.startsWith(CALENDAR_HASH_PREFIX))return null;
    const item=decodeCalendarHash(location.hash);
    const clean=location.pathname+location.search;
    history.replaceState(history.state,'',clean||location.pathname);
    if(!item)showToast(tr('calendarHandoffInvalid'));
    return item;
  }
  function safariCalendarUrl(item,pageHref){
    const current=new URL(pageHref||location.href);
    current.hash=encodeCalendarHash(item);
    const scheme=current.protocol==='http:'?'x-safari-http':'x-safari-https';
    return `${scheme}://${current.host}${current.pathname}${current.search}${current.hash}`;
  }
  function compactStamp(date){
    const pad=value=>String(value).padStart(2,'0');
    return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
  }
  function googleCalendarUrl(item){
    const timed=typeof item.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time);
    let dates;
    if(timed){
      const [hour,minute]=item.time.split(':').map(Number);
      const start=new Date(...item.date.split('-').map((value,index)=>index===1?Number(value)-1:Number(value)),hour,minute);
      const end=new Date(start.getTime()+60*60000);
      dates=`${compactStamp(start)}/${compactStamp(end)}`;
    }else{
      dates=`${compactDate(item.date)}/${compactDate(isoDate(shifted(localDate(item.date),1)))}`;
    }
    const title=String(item.title).includes(APP_BRAND)?String(item.title):`${item.title} · ${APP_BRAND}`;
    const description=String(item.description||'');
    const suffix=`${APP_BRAND} · OJ Gutachter`;
    const params=new URLSearchParams({action:'TEMPLATE',text:title,dates,details:description.includes(suffix)?description:`${description}\n\n${suffix}`});
    if(timed)params.set('ctz','Europe/Berlin');
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
  function calendarControlsHtml(key,variant){
    if(currentCalendarPlatform()==='android'){
      const note=variant==='appointment'?'calendarFileNoteAppointment':'calendarFileNote';
      const fileAttrs=variant==='appointment'?'data-action="appointment-calendar" data-calendar-mode="file"':`data-reminder-calendar="${key}" data-calendar-mode="file"`;
      return `<div class="calendar-actions"><a class="button button-primary button-full" data-calendar-google="${key}" target="_blank" rel="noopener noreferrer" href="https://calendar.google.com/calendar/render?action=TEMPLATE">${tr('calendarGoogle')}</a><button class="button button-secondary button-full calendar-download" type="button" ${fileAttrs}>${tr('calendarFile')}</button><p class="calendar-actions-note">${tr(note)}</p></div>`;
    }
    if(variant==='appointment')return `<button class="button button-secondary button-full calendar-download" type="button" data-action="appointment-calendar">${tr('appointment.calendarButton')}</button>`;
    return `<button class="button button-secondary button-full calendar-download" type="button" data-reminder-calendar="${key}">${tr('calendarButton')}</button>`;
  }
  function calendarItemByKey(key){
    if(key==='besichtigung'){
      const item=typeof appointmentCalendarItem==='function'?appointmentCalendarItem():null;
      return item?{...item,valid:true}:null;
    }
    const item=reminderData().find(entry=>entry.key===key);
    if(!item||!item.valid||!item.date)return null;
    return item;
  }
  function rememberCalendar(item,ics,mode,extra){
    window.__lastReminderCalendar={key:item.key,content:ics,fileName:`OJ-${item.key}-${item.date}.ics`,mode,...extra};
  }
  // Desktop und Android-Zweitweg: echter Download. iOS öffnet damit nur das Teilen-Blatt.
  function downloadIcs(item){
    const ics=createCalendar(item),blob=new Blob([ics],{type:'text/calendar'}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
    const fileName=`OJ-${item.key}-${item.date}.ics`;
    anchor.href=url;anchor.download=fileName;anchor.rel='noopener';document.body.appendChild(anchor);anchor.click();anchor.remove();
    window.setTimeout(()=>URL.revokeObjectURL(url),4000);
    rememberCalendar(item,ics,'download');
    showToast(tr('calendarCreated'));
    return ics;
  }
  function saveCalendarFile(item){return downloadIcs(item);}
  // iOS Safari: Navigation auf einen Blob mit genau „text/calendar“, ohne download-Attribut und ohne charset.
  // Ein data:-Aufruf der obersten Ebene blockt Safari. Der Blob-Typ bleibt erhalten, der Systemdialog kann erscheinen.
  function openIosSafariCalendar(item){
    const ics=createCalendar(item),blob=new Blob([ics],{type:'text/calendar'}),url=URL.createObjectURL(blob);
    rememberCalendar(item,ics,'safari-navigation',{url});
    showToast(tr('calendarSafariPrompt'));
    if(typeof window.__calendarNavigate==='function')window.__calendarNavigate(url);
    else window.location.assign(url);
    window.setTimeout(()=>URL.revokeObjectURL(url),60000);
    return ics;
  }
  function showCalendarSheet(item,ua=navigator.userAgent){
    const box=document.getElementById('calendarDialog');
    if(!box)return;
    const major=iosMajorVersion(ua);
    const offerSafari=major===null||major>=17;
    const safariUrl=safariCalendarUrl(item);
    const googleUrl=googleCalendarUrl(item);
    box.innerHTML=`<h2 id="calendarDialogTitle">${tr('calendarSheetTitle')}</h2><p id="calendarDialogText">${tr('calendarSheetText')}</p>${offerSafari?`<a class="button button-primary button-full" id="calendarSafariLink" href="${escapeHtml(safariUrl)}">${tr('calendarOpenSafari')}</a>`:''}<a class="button button-secondary button-full" id="calendarGoogleLink" href="${escapeHtml(googleUrl)}" target="_blank" rel="noopener noreferrer">${tr('calendarGoogle')}</a><p class="calendar-sheet-hint">${tr(offerSafari?'calendarSafariHint':'calendarSafariOldHint')}</p><button type="button" class="button button-text button-full" data-calendar-dialog="close">${tr('cancel')}</button>`;
    if(!box.open)box.showModal();
    (box.querySelector('#calendarSafariLink')||box.querySelector('#calendarGoogleLink'))?.focus();
    window.__lastCalendarSheet={safariUrl:offerSafari?safariUrl:'',googleUrl,offerSafari};
  }
  function showCalendarHandoffBanner(item){
    const host=document.getElementById('app');
    if(!host||!item||document.getElementById('calendarHandoff'))return;
    const platform=currentCalendarPlatform();
    const banner=document.createElement('div');
    banner.id='calendarHandoff';banner.className='calendar-handoff';
    if(platform==='android'){
      banner.innerHTML=`<p>${tr('calendarHandoffDesktop')}</p><div class="calendar-actions"><a class="button button-primary button-full" id="calendarHandoffGoogle" target="_blank" rel="noopener noreferrer" href="${escapeHtml(googleCalendarUrl(item))}">${tr('calendarGoogle')}</a><button type="button" class="button button-secondary button-full" id="calendarHandoffFile">${tr('calendarFile')}</button></div>`;
    }else{
      banner.innerHTML=`<p>${tr(platform==='ios-safari'?'calendarHandoffFallback':'calendarHandoffDesktop')}</p><button type="button" class="button button-primary button-full" id="calendarHandoffButton">${tr('calendarHandoffButton')}</button>`;
    }
    host.prepend(banner);
    banner.querySelector('#calendarHandoffButton')?.addEventListener('click',()=>{
      if(platform==='ios-safari')openIosSafariCalendar(item);
      else if(platform==='ios-other')showCalendarSheet(item);
      else downloadIcs(item);
    });
    banner.querySelector('#calendarHandoffFile')?.addEventListener('click',()=>downloadIcs(item));
  }
  function openCalendarFromHandoff(item){
    window.__pendingHandoffCalendar=item;
    const platform=currentCalendarPlatform();
    if(platform==='ios-safari'){showCalendarHandoffBanner(item);openIosSafariCalendar(item);return;}
    if(platform==='ios-other'){showCalendarSheet(item);return;}
    showCalendarHandoffBanner(item);
  }
  function openCalendar(key,mode='auto'){
    const item=calendarItemByKey(key);
    if(!item){
      showToast(key==='besichtigung'?tr('appointment.missingDate'):tr('saveValidDateFirst'));
      if(key==='besichtigung')document.getElementById('appointmentDate')?.focus();
      return null;
    }
    if(mode==='google'){
      const url=googleCalendarUrl(item);
      window.__lastGoogleCalendarUrl=url;
      const opened=window.open(url,'_blank','noopener,noreferrer');
      if(!opened)window.location.assign(url);
      return url;
    }
    if(mode==='file')return downloadIcs(item);
    const platform=currentCalendarPlatform();
    if(platform==='ios-safari')return openIosSafariCalendar(item);
    if(platform==='ios-other'){showCalendarSheet(item);return 'sheet';}
    if(platform==='android')return openCalendar(key,'google');
    return downloadIcs(item);
  }
  function downloadCalendar(key){return openCalendar(key,'auto');}
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
    else reminderState={vehicleName,licensePlate,drivetrain:state.drivetrain,huMonth,tireSeason:tireSeason||'',tireDate:tireSeason?tireDate:'',inspectionDate,currentMileage,inspectionMileage};
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
    const close=event.target.closest('[data-calendar-dialog="close"]');
    if(close){event.preventDefault();document.getElementById('calendarDialog')?.close();return;}
    const google=event.target.closest('[data-calendar-google]');
    if(google){
      const item=calendarItemByKey(google.dataset.calendarGoogle);
      if(!item){
        event.preventDefault();
        showToast(google.dataset.calendarGoogle==='besichtigung'?tr('appointment.missingDate'):tr('saveValidDateFirst'));
        if(google.dataset.calendarGoogle==='besichtigung')document.getElementById('appointmentDate')?.focus();
        return;
      }
      const url=googleCalendarUrl(item);
      google.href=url;
      window.__lastGoogleCalendarUrl=url;
      if(google.tagName!=='A'){
        event.preventDefault();
        const opened=window.open(url,'_blank','noopener,noreferrer');
        if(!opened)window.location.assign(url);
      }
      return;
    }
    const button=event.target.closest('[data-reminder-calendar]');
    if(button){event.preventDefault();openCalendar(button.dataset.reminderCalendar,button.dataset.calendarMode==='file'?'file':'auto');}
  });
  const calendarDialog=document.getElementById('calendarDialog');
  if(calendarDialog)calendarDialog.addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close();});
  Object.assign(window,{syncReminderDrivetrain,saveCalendarFile,renderReminderForm(){app.innerHTML=reminderForm();},renderReminders(){app.innerHTML=overview();},createCalendar,createReminderCalendar:createCalendar,reminderData,reminderBlocks,calendarPlatform,iosMajorVersion,googleCalendarUrl,safariCalendarUrl,encodeCalendarHash,decodeCalendarHash,consumeCalendarFragment,openCalendar,openIosSafariCalendar,openCalendarFromHandoff,showCalendarSheet,showCalendarHandoffBanner,calendarControlsHtml,downloadIcs});
})();

if(typeof window.startOjCheck==='function')window.startOjCheck();
