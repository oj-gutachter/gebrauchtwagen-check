'use strict';

const STORAGE_KEY = 'oj-gebrauchtwagen-check.v1';
const CONTACT = Object.freeze({
  phoneDisplay: '0176 21468719',
  phoneLink: 'tel:+4917621468719',
  landlineDisplay: '0231 62855200',
  landlineLink: 'tel:+4923162855200',
  email: 'info@oj-gutachter.de',
  website: 'https://www.oj-gutachter.de/',
  address: 'Meißener Straße 62, 44139 Dortmund'
});

const sourceSteps = [
  {
    title: 'Papiere & Historie',
    shortTitle: 'Papiere',
    intro: 'Prüfen Sie Fahrzeug und Verkäufer, bevor Sie sich auf den Preis festlegen.',
    tip: 'Lassen Sie sich die Originalpapiere zeigen. Vergleichen Sie die FIN an Windschutzscheibe, am Fahrzeug und in der Zulassungsbescheinigung Teil II.<br><br>Stimmen die Unterlagen nicht oder weicht die FIN ab, sollten Sie den Kauf erst nach einer fachlichen Klärung fortsetzen.',
    items: [
      {title:'Zulassungsbescheinigungen Teil I und Teil II',hint:'Beide vorhanden? Fahrzeugdaten und Halterangaben lesbar und vollständig?'},
      {title:'Fahrzeug-Identifikationsnummer (FIN) vergleichen',hint:'FIN in den Papieren und am Fahrzeug müssen übereinstimmen und unverändert aussehen.'},
      {title:'Verkäufer und Fahrzeughalter klären',hint:'Verkauft der Halter selbst? Bei einer Vertretung die Vollmacht und Ausweispapiere prüfen.'},
      {title:'HU/AU und Vorführtermine',hint:'Prüfberichte der Hauptuntersuchung und Nachweise zu festgestellten Mängeln ansehen.'},
      {title:'Service- und Reparaturhistorie',hint:'Serviceheft, Wartungsnachweise und Rechnungen lückenlos? Kilometerstände nachvollziehbar?'},
      {title:'Schlüssel, Freigaben und Zusatzausstattung',hint:'Alle Schlüssel vorhanden? Offene Finanzierung sowie Rückrufe und Sonderausstattung klären.'}
    ]
  },
  {
    title: 'Karosserie & Unfallspuren',
    shortTitle: 'Karosserie',
    intro: 'Ungleiche Spalte oder nachlackierte Teile können auf Reparaturen hinweisen.',
    tip: 'Sehen Sie das Fahrzeug bei Tageslicht und möglichst trocken an. Ein Magnet kann grobe Spachtelstellen an Stahlteilen zeigen, funktioniert aber nicht bei Aluminium oder Kunststoff.',
    items: [
      {title:'Spaltmaße rundum vergleichen',hint:'Spalten an Türen, Haube und Heckklappe links/rechts vergleichen. Gleichmäßige, schmale Fugen sind ein gutes Zeichen.'},
      {title:'Lackunterschiede und Welligkeit',hint:'Im schrägen Licht auf Farbton, Glanz, Lacktränen, Staubeinschlüsse und unruhige Oberflächen achten.'},
      {title:'Lacknebel (Overspray) an Anbauteilen',hint:'Dichtungen, Kunststoffteile, Zierleisten und Scharniere auf feinen Lacknebel prüfen.'},
      {title:'Schweißnähte und Falze',hint:'Werksseitige Punktschweißnähte, Versiegelungen und Kanten sollten gleichmäßig aussehen.'},
      {title:'Schrauben, Scharniere und Verschraubungen',hint:'Abplatzungen, verdrückte Schraubenköpfe oder Werkzeugspuren können auf Aus- und Einbau hindeuten.'},
      {title:'Scheiben, Lampen und Dichtungen',hint:'Herstellerzeichen und Datumscodes vergleichen; Risse, Steinschläge und Feuchtigkeit prüfen.'},
      {title:'Unterboden und tragende Teile',hint:'Soweit sicher einsehbar auf starke Deformierungen, grobe Reparaturen oder Undichtigkeiten achten.'}
    ]
  },
  {
    title: 'Lack & Rost',
    shortTitle: 'Lack & Rost',
    intro: 'Prüfen Sie die Außenhaut und typische Stellen, an denen Rost beginnt.',
    tip: 'Oberflächlicher Flugrost ist etwas anderes als durchrostender Stahl. Fotografieren Sie auffällige Stellen und prüfen Sie besonders Radläufe, Kanten und Unterboden.',
    items: [
      {title:'Lackschäden und Kratzer',hint:'Tiefe Kratzer, Abplatzungen und Dellen im Licht aus verschiedenen Richtungen prüfen.'},
      {title:'Rost an Türen, Kanten und Radläufen',hint:'Blasen im Lack, braune Stellen und grobe Roststellen von allen Seiten ansehen.'},
      {title:'Unterboden, Schweller und Kofferraumwanne',hint:'Auf Durchrostung, undichte Stellen und verdeckte Schäden achten. Nur gefahrlos einsehbare Bereiche prüfen.'},
      {title:'Folierung oder auffällige Abdeckungen',hint:'Folien und grobe Unterbodenschutz-Schichten können Schäden verdecken. Klären, was darunter ist.'}
    ]
  },
  {
    title: 'Reifen & Bremsen',
    shortTitle: 'Reifen & Bremsen',
    intro: 'Reifen und Bremsen zeigen Verschleiß und können teure Folgekosten verursachen.',
    tip: 'Gesetzlich sind mindestens 1,6 mm Profiltiefe vorgeschrieben (§ 36 Abs. 2 StVZO). Für Sicherheit und Nässe kann ein früherer Wechsel sinnvoll sein. Prüfen Sie Alter und Zustand, nicht nur das Profil.',
    items: [
      {title:'Profiltiefe und Verschleißbild',hint:'An mehreren Stellen und quer zur Lauffläche prüfen. Einseitiger Verschleiß kann auf Fahrwerkfehler hindeuten.'},
      {title:'Reifenalter und Reifenarten',hint:'DOT-Datum aller Reifen vergleichen. Reifen sollten zur Saison passen und keine Risse oder Beulen zeigen.'},
      {title:'Dimension und Freigabe',hint:'Reifengröße, Last- und Geschwindigkeitsindex mit Fahrzeugpapieren/Freigaben vergleichen.'},
      {title:'Felgen und Ersatzrad/Pannenset',hint:'Felgen auf Risse und starke Schäden prüfen. Ersatzrad oder Pannenset auf Vollständigkeit kontrollieren.'},
      {title:'Bremsscheiben und Beläge',hint:'Soweit sichtbar: tiefe Riefen, großer Rand, starke Korrosion und verschlissene Beläge festhalten.'}
    ]
  },
  {
    title: 'Innenraum & Kilometerstand',
    shortTitle: 'Innenraum',
    intro: 'Vergleichen Sie den Zustand im Innenraum mit Alter und angezeigtem Kilometerstand.',
    tip: 'Ein starker Unterschied zwischen Abnutzung und Kilometerstand ist kein Beweis für Manipulation, aber ein guter Grund für weitere Prüfung. Prüfberichte und Rechnungen helfen beim Vergleichen.',
    items: [
      {title:'Lenkrad, Schaltung und Pedale',hint:'Abnutzung und Glanzstellen sollten plausibel zu Laufleistung und Alter passen.'},
      {title:'Sitze, Gurtbänder und Polster',hint:'Durchgesessen, stark abgerieben oder feucht? Gurte vollständig ausziehen und einrasten lassen.'},
      {title:'Kilometerstand beim Starten',hint:'Kilometerstand notieren und mit Serviceheft, Rechnungen und HU-Berichten vergleichen.'},
      {title:'Kontrollleuchten und Bordelektronik',hint:'Beim Zündungsstart gehen Kontrollleuchten kurz an. Nach dem Start sollten Warnleuchten erlöschen.'},
      {title:'Fenster, Dach, Klima und Heizung',hint:'Elektrische Fenster, Schiebedach, Heizung und Klimaanlage während der Besichtigung testen.'},
      {title:'Geruch, Feuchtigkeit und Wasserspuren',hint:'Auf Modergeruch, feuchte Teppiche und Wasser unter den Matten achten.'}
    ]
  },
  {
    title: 'Motorraum & Flüssigkeiten',
    shortTitle: 'Motorraum',
    intro: 'Blicken Sie nur bei sicherem Fahrzeugzustand in den Motorraum – nichts im laufenden Betrieb anfassen.',
    tip: 'Der Motor sollte beim Start kalt sein, wenn ein Kaltstart vereinbart ist. Flüssigkeitsstände nur nach Herstellerangabe und bei ausreichend abgekühltem Motor prüfen. Heiße Teile und Drucksysteme nicht öffnen.',
    items: [
      {title:'Motoröl und Öldeckel',hint:'Ölstand und sichtbaren Zustand prüfen. Milchiger Belag oder metallischer Glanz ist ein Warnsignal.'},
      {title:'Kühlmittel und sichtbare Leitungen',hint:'Stand und Farbe nur kalten Systems prüfen; Leitungen auf Risse und Undichtigkeit ansehen.'},
      {title:'Flüssigkeitsspuren unter dem Fahrzeug',hint:'Öl-, Kühlmittel- oder andere Flecken am Standort und sichtbare Nässe an Motor/Getriebe notieren.'},
      {title:'Riemen, Batterie und Steckverbindungen',hint:'Sichtbare Riemen auf Risse, Batteriepole auf Korrosion und Leitungen auf lose Verbindungen prüfen.'},
      {title:'Motorstart und Leerlauf',hint:'Beim Start auf ungewöhnliche Geräusche, Warnleuchten, starkes Ruckeln und Rauchentwicklung achten.'},
      {title:'Motorraum auf Unfallspuren',hint:'Traversen, Längsträger und Schürzen soweit sichtbar auf Verformungen, frische Schweißarbeit und Farbwechsel prüfen.'}
    ]
  },
  {
    title: 'Probefahrt',
    shortTitle: 'Probefahrt',
    intro: 'Fahren Sie nur mit gültiger Zulassung, Versicherungsschutz und Zustimmung des Verkäufers.',
    tip: 'Wählen Sie eine sichere Strecke mit verschiedenen Geschwindigkeiten und sanften Bremsungen. Vorher Fahrerlaubnis, Zulassung und Versicherung klären. Keine riskanten Fahrversuche im Verkehr.',
    items: [
      {title:'Anfahren, Schalten und Kupplung',hint:'Achten Sie auf Schleifen, Rucken, schweres Schalten oder ungewöhnliche Geräusche beim Anfahren.'},
      {title:'Lenkung und Geradeauslauf',hint:'Lenkung sollte ohne großes Spiel reagieren. Fahrzeug sollte bei sicherer Fahrbahn nicht stark ziehen.'},
      {title:'Bremsen und ABS',hint:'Bei normaler Bremsung sollte das Fahrzeug stabil bleiben und nicht einseitig ziehen oder rubbeln.'},
      {title:'Fahrwerk und Federung',hint:'Bei Unebenheiten auf Poltern, Klappern, starkes Nachschwingen oder einseitige Geräusche achten.'},
      {title:'Motorleistung, Temperatur und Rauch',hint:'Gleichmäßiger Lauf, normale Temperaturanzeige und kein auffälliger Rauch aus dem Auspuff.'},
      {title:'Assistenzsysteme und Funktionen',hint:'Verfügbare Kamera, Parksensoren, Tempomat und Assistenten auf Funktion und Warnmeldungen testen.'}
    ]
  },
  {
    title: 'Kaufvertrag & Übergabe',
    shortTitle: 'Kaufvertrag',
    intro: 'Halten Sie Zusagen schriftlich fest und prüfen Sie alles vor der Unterschrift.',
    tip: 'Beim Kauf von einem Händler gelten gesetzliche Gewährleistungsrechte. Bei einem Privatkauf sind die Regeln anders. Arglistig verschwiegene Mängel dürfen nicht einfach ausgeschlossen werden. Lassen Sie unklare Vertragsklauseln vor der Unterschrift rechtlich prüfen.',
    items: [
      {title:'Vertragsparteien und Fahrzeugdaten vollständig',hint:'Namen, Adressen, FIN, Erstzulassung, Kilometerstand, Preis und Datum sorgfältig prüfen.'},
      {title:'Bekannte Unfälle und Mängel schriftlich aufnehmen',hint:'Auch mündliche Zusagen wie „unfallfrei“ oder „scheckheftgepflegt“ konkret im Vertrag festhalten.'},
      {title:'Zusage zum Zustand und zur Historie',hint:'Vorschäden, Art der Nutzung, Halter und Wartung nur so aufnehmen, wie sie tatsächlich bestätigt werden.'},
      {title:'Zubehör, Schlüssel und Papiere auflisten',hint:'Zweitsatz Räder, Wartungsnachweise, Schlüssel, Freischaltcodes und Zusatzgeräte einzeln aufführen.'},
      {title:'Gewährleistung und Garantie unterscheiden',hint:'Klauseln lesen und Verkäufertyp beachten. Nicht vorschnell einen pauschalen Haftungsausschluss unterschreiben.'},
      {title:'Kaufpreis, Zahlung und Übergabe regeln',hint:'Termin, Zahlungsweg, Übergabezeitpunkt und Ummeldung eindeutig schriftlich vereinbaren.'}
    ]
  }
];

const sourceStatus = {
  ok: {label:'In Ordnung', short:'OK', icon:'✓'},
  issue: {label:'Auffällig', short:'Auffällig', icon:'!'},
  unclear: {label:'Unklar', short:'Unklar', icon:'?'}
};
let state = createState();
let route = 'home';
let contactOrigin = 'summary';
let previousRoute = 'home';
let storageAvailable = true;
let toastTimer;
const app = document.getElementById('app');

const DRIVE_TYPES=['petrol','diesel','hybrid','electric'];
const VEHICLE_FIELDS=[
  {key:'makeModel',label:'printMakeModel',placeholder:'',type:'text'},
  {key:'registration',label:'printRegistration',placeholder:'',type:'text'},
  {key:'mileage',label:'printMileage',placeholder:'',type:'text'},
  {key:'firstRegistration',label:'printFirstRegistration',placeholder:'',type:'text'},
  {key:'seller',label:'printSeller',placeholder:'',type:'text'}
];
function printDate(value=new Date()){
  const date=value instanceof Date?value:new Date(value);
  return new Intl.DateTimeFormat(currentLanguage==='ar'?'ar-EG':currentLanguage,{day:'2-digit',month:'2-digit',year:'numeric'}).format(date);
}
function vehicleValue(key){return state.vehicle&&typeof state.vehicle[key]==='string'?state.vehicle[key].trim():'';}
function noteValue(key){return state.notes&&typeof state.notes[key]==='string'?state.notes[key].trim():'';}
const ELECTRIC_ROAD_ITEMS=[1,2,3,5];
function stepsFor(drive){
  const base=(index,itemIndexes=null)=>({id:String(index),textKey:`steps.${index}`,itemIndexes:itemIndexes||sourceSteps[index].items.map((_,i)=>i)});
  if(drive==='electric')return [base(0),base(1),base(2),base(3),base(4),{id:'ev',textKey:'electricStep',itemIndexes:Array.from({length:12},(_,i)=>i)},{id:'5',textKey:'electricEngineStep',itemIndexes:[1,2,5]},base(6,ELECTRIC_ROAD_ITEMS),base(7)];
  if(drive==='hybrid')return [base(0),base(1),base(2),base(3),base(4),{id:'hy',textKey:'hybridStep',itemIndexes:Array.from({length:6},(_,i)=>i)},base(5),base(6),base(7)];
  return sourceSteps.map((_,i)=>base(i));
}
function activeSteps(){return stepsFor(state.drivetrain);}
function activePoints(){
  return activeSteps().flatMap(step=>step.itemIndexes.map(itemIndex=>({key:`${step.id}-${itemIndex}`,step,itemIndex,textKey:`${step.textKey}.items.${itemIndex}`})));
}
function driveText(step,field){return tr(`${step.textKey}.${field}`);}
function driveItemText(point,field){return tr(`${point.textKey}.${field}`);}
function driveLabel(){return state.drivetrain?tr(`drive.${state.drivetrain}`):'';}
function createState(){
  return {version:2, drivetrain:null, step:0, answers:{}, notes:{}, vehicle:{}, appointment:{date:'',time:''}, startedAt:null, completedAt:null};
}
function normalizeState(raw){
  const clean=createState();
  const validAnswerKeys=new Set(['petrol','hybrid','electric'].flatMap(drive=>stepsFor(drive).flatMap(step=>step.itemIndexes.map(itemIndex=>`${step.id}-${itemIndex}`))));
  if(!raw || typeof raw!=='object') return clean;
  clean.drivetrain=DRIVE_TYPES.includes(raw.drivetrain)?raw.drivetrain:null;
  clean.step=Number.isInteger(raw.step) ? Math.min(Math.max(raw.step,0),stepsFor(clean.drivetrain).length-1) : 0;
  clean.startedAt=typeof raw.startedAt==='string' ? raw.startedAt : null;
  clean.completedAt=typeof raw.completedAt==='string' ? raw.completedAt : null;
  if(raw.notes && typeof raw.notes==='object'){
    Object.entries(raw.notes).forEach(([key,value])=>{if(validAnswerKeys.has(key)&&typeof value==='string')clean.notes[key]=value.slice(0,500);});
  }
  if(raw.vehicle && typeof raw.vehicle==='object'){
    clean.vehicle={};
    VEHICLE_FIELDS.forEach(field=>{if(typeof raw.vehicle[field.key]==='string')clean.vehicle[field.key]=raw.vehicle[field.key].slice(0,field.key==='generalNotes'?1000:160);});
  }
  if(raw.appointment && typeof raw.appointment==='object'){
    if(isValidIsoDate(raw.appointment.date))clean.appointment.date=raw.appointment.date;
    if(clean.appointment.date&&typeof raw.appointment.time==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(raw.appointment.time))clean.appointment.time=raw.appointment.time;
  }
  if(raw.answers && typeof raw.answers==='object'){
    Object.entries(raw.answers).forEach(([key,value])=>{
      if(validAnswerKeys.has(key)&&sourceStatus[value])clean.answers[key]=value;
    });
  }
  return clean;
}
function isValidIsoDate(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const [year,month,day]=value.split('-').map(Number),date=new Date(year,month-1,day);
  return year>=1900&&year<=2200&&date.getFullYear()===year&&date.getMonth()===month-1&&date.getDate()===day;
}
function appointmentValue(){return state.appointment&&typeof state.appointment==='object'?state.appointment:{date:'',time:''};}
function appointmentCard(){
  const appointment=appointmentValue();
  return `<section class="appointment-card" aria-labelledby="appointmentTitle">
        <div class="appointment-head"><div class="reminder-home-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 10h18M8 14h3v3H8z"/></svg></div><div><p class="eyebrow">${tr('appointment.eyebrow')}</p><h2 id="appointmentTitle">${tr('appointment.title')}</h2></div></div>
        <p>${tr('appointment.text')}</p>
        <div class="appointment-fields"><label for="appointmentDate"><span class="field-label">${tr('appointment.date')}</span><input id="appointmentDate" type="date" data-action="appointment-field" data-field="date" value="${escapeHtml(appointment.date||'')}"></label><label for="appointmentTime"><span class="field-label">${tr('appointment.time')} <span>(${tr('optional')})</span></span><input id="appointmentTime" type="time" data-action="appointment-field" data-field="time" value="${escapeHtml(appointment.time||'')}" ${appointment.date?'':'disabled'}></label></div>
        <button class="button button-secondary button-full calendar-download" type="button" data-action="appointment-calendar">${tr('appointment.calendarButton')}</button>
      </section>`;
}
function backupHomeCard(){
  return `<section class="backup-home-card" aria-labelledby="backupHomeTitle">
        <div class="reminder-home-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 3v11m-4-4 4 4 4-4"/><path d="M5 15v3a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3"/></svg></div>
        <div class="reminder-home-copy"><p class="eyebrow">${tr('backup.homeEyebrow')}</p><h2 id="backupHomeTitle">${tr('backup.title')}</h2><p>${tr('backup.homeText')}</p></div>
        <button class="button button-secondary button-full" type="button" data-action="backup">${tr('backup.open')} ${iconArrow()}</button>
      </section>`;
}
function appointmentCalendarItem(){
  const appointment=appointmentValue();
  if(!isValidIsoDate(appointment.date))return null;
  const car=vehicleValue('makeModel');
  return {key:'besichtigung',date:appointment.date,time:appointment.time||'',title:car?`${tr('appointment.eventTitle')}: ${car}`:tr('appointment.eventTitle'),description:tr('appointment.description')};
}
function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(raw) state=normalizeState(JSON.parse(raw));
  }catch(error){storageAvailable=false;}
}
function save(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  catch(error){storageAvailable=false;showToast(tr('storageError'));}
}
function counts(){
  const points=activePoints(),values=points.map(point=>state.answers[point.key]).filter(value=>sourceStatus[value]);
  return {ok:values.filter(v=>v==='ok').length,issue:values.filter(v=>v==='issue').length,unclear:values.filter(v=>v==='unclear').length,total:points.length};
}
function isComplete(){return !!state.drivetrain&&activePoints().every(point=>sourceStatus[state.answers[point.key]]);}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function backArrow(){return currentLanguage==='ar'?'→':'←';}
function iconArrow(){return '<svg class="direction-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';}
function updateHeader(){document.getElementById('homeButton').classList.toggle('hidden',route==='home');}
function setRoute(next,{scroll=true}={}){
  previousRoute=route;
  route=next;
  render();
  if(scroll) window.scrollTo({top:0,behavior:'instant'});
}
function render(){
  updateHeader();
  if(route==='check') renderChecklist();
  else if(route==='summary') renderSummary();
  else if(route==='contact') renderContact();
  else if(route==='reminders') renderReminders();
  else if(route==='reminder-form') renderReminderForm();
  else if(route==='privacy') renderPrivacy();
  else if(route==='backup'&&typeof renderBackup==='function') renderBackup();
  else renderHome();
}
function renderHome(){
  const answered=Object.keys(state.answers).length;
  const started=!!state.startedAt && answered>0;
  app.innerHTML=`
    <section class="hero">
      <p class="eyebrow">${tr('homeEyebrow')}</p>
      <h1>${tr('heroLine1')}<span>${tr('heroLine2')}</span></h1>
      <p class="hero-copy">${tr('heroCopy')}</p>
      <button class="button button-light" type="button" data-action="start">${started?tr('continueCheck'):tr('startCheck')} ${iconArrow()}</button>
      ${started?`<button class="button second-action button-full" type="button" data-action="ask-reset">${tr('beginNewCheck')}</button>`:''}
      <p class="hero-note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10V7a6 6 0 0 1 12 0v3M5 10h14v11H5Z"/></svg> ${tr('heroNote')}</p>
    </section>
    <div class="home-content">
      <div class="section-heading"><h2>${tr('checklistHeading')}</h2><span>${tr('stepsAndPointsDynamic',{steps:activeSteps().length,points:counts().total})}</span></div>
      <ol class="steps-preview">
        ${activeSteps().map((step,i)=>`<li><span class="step-num">${String(i+1).padStart(2,'0')}</span>${driveText(step,'shortTitle')}</li>`).join('')}
      </ol>
      ${appointmentCard()}
      <section class="reminder-home-card">
        <div class="reminder-home-icon" aria-hidden="true">✓</div>
        <div class="reminder-home-copy"><p class="eyebrow">${tr('afterPurchase')}</p><h2>${tr('myCarReminders')}</h2><p>${tr('remindersIntro')}</p></div>
        <button class="button button-secondary button-full" type="button" data-action="reminders">${tr('viewDates')} ${iconArrow()}</button>
      </section>
      ${backupHomeCard()}
      <aside class="trust-card">
        <div class="trust-card-icon" aria-hidden="true">i</div>
        <div><h2>${tr('orientationTitle')}</h2><p>${tr('orientationText')}</p></div>
      </aside>
      ${started?`<p class="local-notice">${isComplete()?tr('checkComplete'):tr('answersSaved')} <button class="button button-text" type="button" data-action="summary">${tr('toSummary')} <span class="direction-arrow" aria-hidden="true">${currentLanguage==='ar'?'←':'→'}</span></button></p>`:`<p class="local-notice">${tr('offlineInfo')}</p>`}
    </div>`;
}
function renderDrivetrainChoice(){
  const icons={
    petrol:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 27V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v21M5 27h18M10 8h8v7h-8zM21 10l4 4v10a2 2 0 0 0 4 0v-8l-4-5"/></svg>',
    diesel:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C12 9 7 14 7 20a9 9 0 0 0 18 0c0-6-5-11-9-17Z"/><path d="M11 21a5 5 0 0 0 5 4"/></svg>',
    hybrid:'<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M26 5C14 5 6 10 6 19a8 8 0 0 0 8 8c9 0 12-10 12-22Z"/><path d="M5 28c4-8 9-12 16-16M17 12l-4 6h5l-3 6"/></svg>',
    electric:'<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="3" y="8" width="24" height="17" rx="3"/><path d="M27 13h3v7h-3M17 10l-6 8h5l-2 5 7-9h-5z"/></svg>'
  };
  app.innerHTML=`<section class="drive-page">
    <button type="button" class="route-back" data-action="home"><span aria-hidden="true">${currentLanguage==='ar'?'→':'←'}</span> ${tr('backToStart')}</button>
    <p class="eyebrow">${tr('drive.eyebrow')}</p><h1>${tr('drive.title')}</h1><p class="page-intro">${tr('drive.intro')}</p>
    <div class="drive-options" role="group" aria-label="${tr('drive.title')}">
      ${DRIVE_TYPES.map(drive=>`<button type="button" class="drive-option ${state.drivetrain===drive?'selected':''}" data-action="select-drive" data-drive="${drive}" aria-pressed="${state.drivetrain===drive}"><span class="drive-icon ${drive}" aria-hidden="true">${icons[drive]}</span><span class="drive-option-copy"><strong>${tr(`drive.${drive}`)}</strong><small>${tr(`drive.${drive}Hint`)}</small></span><span class="drive-check" aria-hidden="true">✓</span></button>`).join('')}
    </div><p class="save-hint">${tr('drive.savedNote')}</p></section>`;
}
function renderChecklist(){
  if(!state.drivetrain){renderDrivetrainChoice();return;}
  const steps=activeSteps();
  state.step=Math.min(Math.max(state.step,0),steps.length-1);
  const step=steps[state.step];
  const points=step.itemIndexes.map(itemIndex=>({key:`${step.id}-${itemIndex}`,step,itemIndex,textKey:`${step.textKey}.items.${itemIndex}`}));
  const answeredInStep=points.filter(point=>state.answers[point.key]).length;
  app.innerHTML=`
    <div class="progress-wrap">
      <div class="progress-top"><span>${tr('stepOf',{step:state.step+1,total:steps.length})}</span><strong>${tr('checkedOf',{answered:answeredInStep,total:points.length})}</strong></div>
      <div class="progress-track" role="progressbar" aria-label="${tr('progressLabel')}" aria-valuemin="0" aria-valuemax="${points.length}" aria-valuenow="${answeredInStep}"><div class="progress-bar" style="width:${answeredInStep/points.length*100}%"></div></div>
      <nav class="step-dots" aria-label="${tr('stepNavLabel')}">${steps.map((entry,i)=>`<button class="step-dot ${i===state.step?'current':''} ${entry.itemIndexes.every(ii=>state.answers[`${entry.id}-${ii}`])?'done':''}" type="button" data-action="goto-step" data-step="${i}" aria-label="${tr('stepLabel',{step:i+1,title:driveText(entry,'title')})}" ${i===state.step?'aria-current="step"':''}></button>`).join('')}</nav>
    </div>
    <div class="step-content">
      <div class="step-intro"><p class="eyebrow">${tr('inspectionEyebrow',{step:String(state.step+1).padStart(2,'0')})}</p><h1>${driveText(step,'title')}</h1><p>${driveText(step,'intro')}</p><button type="button" class="drive-change" data-action="choose-drive">${tr('drive.change',{drive:driveLabel()})}</button></div>
      <aside class="expert-tip ${['ev','hy'].includes(step.id)?'high-voltage-tip':''}"><span class="tip-bulb" aria-hidden="true">${['ev','hy'].includes(step.id)?'⚡':'✦'}</span><div><strong>${['ev','hy'].includes(step.id)?tr('drive.safetyTitle'):tr('expertTip')}</strong><p>${driveText(step,'tip')}</p></div></aside>
      <div class="checklist">
        ${points.map((point,i)=>{
          const value=state.answers[point.key]||'';
          return `<article class="check-item" data-status="${value}" data-point-key="${point.key}">
            <div class="check-item-title"><span class="check-number">${String(i+1).padStart(2,'0')}</span><h2>${driveItemText(point,'title')}</h2></div>
            <p class="check-tip">${driveItemText(point,'hint')}</p>
            <div class="check-note"><label for="note-${point.key}">${tr('printNoteColumn')} <span>(${tr('optional')})</span><input id="note-${point.key}" type="text" data-action="point-note" data-key="${point.key}" value="${escapeHtml(noteValue(point.key))}" maxlength="500" placeholder="${tr('printNotePlaceholder')}" autocomplete="off"></label></div>
            <div class="choice-group" role="group" aria-label="${tr('ratingLabel',{title:driveItemText(point,'title')})}">
              ${Object.entries(sourceStatus).map(([status,meta])=>`<button class="choice" type="button" data-action="answer" data-key="${point.key}" data-value="${status}" aria-pressed="${value===status}"><span class="choice-symbol" aria-hidden="true">${meta.icon}</span>${tr('status.'+status)}</button>`).join('')}
            </div>
          </article>`;
        }).join('')}
      </div>
      <p class="save-hint">${storageAvailable?tr('savedLocally'):tr('sessionOnly')}</p>
      <div class="step-actions">
        <button type="button" class="button button-secondary" data-action="previous"><span aria-hidden="true">${currentLanguage==='ar'?'→':'←'}</span> ${tr('back')}</button>
        ${state.step===steps.length-1?`<button type="button" class="button button-primary" data-action="summary">${tr('summary')} ${iconArrow()}</button>`:`<button type="button" class="button button-primary" data-action="next">${tr('next')} ${iconArrow()}</button>`}
        <button type="button" class="button button-text" data-action="summary">${tr('viewSummary')}${!isComplete()?tr('notComplete'):''}</button>
      </div>
    </div>`;
}

function summaryStatus(){
  const c=counts();
  if(c.issue>0) return {class:'red',icon:'!',title:tr('resultIssueTitle'),text:tr(c.issue===1?'resultIssueOne':'resultIssueMany',{n:c.issue})+(c.unclear?tr(c.unclear===1?'resultUnclearOne':'resultUnclearMany',{n:c.unclear}):'')};
  if(c.unclear>0) return {class:'amber',icon:'?',title:tr('resultUnclearTitle'),text:tr(c.unclear===1?'unclearExplanationOne':'unclearExplanationMany',{n:c.unclear})};
  if(c.ok===c.total) return {class:'green',icon:'✓',title:tr('resultAllOkTitle'),text:tr('resultAllOkText')};
  return {class:'amber',icon:'…',title:tr('resultIncompleteTitle'),text:tr('resultIncompleteText')};
}
function findings(){
  const output=[];
  activeSteps().forEach((step,displayIndex)=>{
    const entries=step.itemIndexes.map(itemIndex=>({key:`${step.id}-${itemIndex}`,itemIndex,textKey:`${step.textKey}.items.${itemIndex}`})).filter(point=>['issue','unclear'].includes(state.answers[point.key]));
    if(!entries.length)return;
    output.push(`<section class="findings-group"><h3>${displayIndex+1}. ${driveText(step,'title')}</h3>${entries.map(point=>`<div class="finding ${state.answers[point.key]}"><span class="finding-label">${tr('status.'+state.answers[point.key])}</span><p>${driveItemText(point,'title')}</p></div>`).join('')}</section>`);
  });
  return output;
}
function printVehicleText(value){
  return value?escapeHtml(value):'<span class="print-blank-line" aria-hidden="true"></span>';
}
function printStatusChip(status,count){
  return `<span class="print-chip ${status}"><b aria-hidden="true">${sourceStatus[status].icon}</b><strong>${count}</strong> ${tr(status==='ok'?'okAbbreviation':status==='unclear'?'unclearAbbreviation':'issueAbbreviation')}</span>`;
}
function printPointRow(point,index){
  const answer=sourceStatus[state.answers[point.key]]?state.answers[point.key]:'unrated';
  const icon=answer==='unrated'?'–':sourceStatus[answer].icon;
  return `<tr class="print-result-${answer}"><td class="print-point"><span class="print-point-number">${index+1}.</span> ${escapeHtml(driveItemText(point,'title'))}</td><td class="print-result"><span aria-hidden="true">${icon}</span> <small>${escapeHtml(answer==='unrated'?tr('drive.unrated'):tr('status.'+answer))}</small></td><td class="print-note" data-print-note="${point.key}">${escapeHtml(noteValue(point.key))||tr('printNoNote')}</td></tr>`;
}
function refreshPrintFooters(){
  const report=app.querySelector('.print-report');
  if(!report)return;
  report.querySelectorAll('.print-page-footer').forEach(footer=>footer.remove());
  const mm=96/25.4;
  const printableHeight=(297-15-34)*mm;
  const pageCount=Math.max(1,Math.ceil(report.scrollHeight/printableHeight));
  for(let index=0;index<pageCount;index++){
    report.insertAdjacentHTML('beforeend',`<div class="print-page-footer" style="top:${(index+1)*printableHeight+9*mm}px"><span class="print-footer-disclaimer">${tr('summaryLegal')}</span><span class="print-footer-meta">${tr('printCreatedWith')}<span class="print-page-number">${tr('printPage',{page:index+1,pages:pageCount})}</span></span></div>`);
  }
}

function printReport(c,s,recommendation){
  const flagged=activeSteps().flatMap((step,stepIndex)=>step.itemIndexes.map((itemIndex,itemIndexInStep)=>({key:`${step.id}-${itemIndex}`,textKey:`${step.textKey}.items.${itemIndex}`,step,stepIndex,itemIndexInStep}))).filter(point=>['issue','unclear'].includes(state.answers[point.key]));
  const contactLine=`Larry O. Johnson · ${tr('profession')} · ${CONTACT.address} · Tel. ${CONTACT.landlineDisplay} / ${CONTACT.phoneDisplay} · ${CONTACT.email} · www.oj-gutachter.de`;
  return `<article class="print-report" aria-label="${escapeHtml(tr('printProtocolTitle'))}">
    
    <header class="print-letterhead"><img src="assets/oj-rund.png" alt="OJ Gutachter" width="72" height="72"><div class="print-office"><p class="print-office-name">OJ Gutachter <span>– ${tr('printOfficeSubtitle')}</span></p><p class="print-contact-line" dir="auto">${contactLine}</p></div></header>
    <div class="print-title-row"><h1>${tr('printProtocolTitle')}</h1><p>${tr('printCreatedOn',{date:printDate()})}${state.startedAt?`<br>${tr('printCheckDate',{date:printDate(state.startedAt)})}`:''}</p></div>
    <section class="print-vehicle"><h2>${tr('printVehicleData')}</h2><dl>${VEHICLE_FIELDS.map(field=>`<div class="print-vehicle-field print-field-${field.key}"><dt>${tr(field.label)}</dt><dd data-print-vehicle="${field.key}">${printVehicleText(vehicleValue(field.key))}</dd></div>`).join('')}</dl>${vehicleValue('generalNotes')?`<p class="print-general-notes"><strong>${tr('printGeneralNotes')}:</strong> <span data-print-general-notes>${escapeHtml(vehicleValue('generalNotes'))}</span></p>`:'<p class="print-general-notes" hidden><strong>'+tr('printGeneralNotes')+':</strong> <span data-print-general-notes></span></p>'}</section>
    <section class="print-summary-box"><div class="print-summary-top"><div><p class="print-section-label">${tr('printSummaryTitle')}</p><h2>${s.title}</h2></div><span class="print-ampel ${s.class}" aria-hidden="true"><i></i><i></i><i></i></span></div><p class="print-summary-text">${s.text}</p><p class="print-drive"><strong>${tr('drive.summaryLabel')}:</strong> ${driveLabel()} · ${c.total} ${tr('drive.points')}</p><div class="print-chips">${printStatusChip('ok',c.ok)}${printStatusChip('issue',c.issue)}${printStatusChip('unclear',c.unclear)}</div></section>
    <section class="print-findings"><h2>${tr('printFindingsTitle')}</h2>${flagged.length?`<table><thead><tr><th>${tr('printPointColumn')}</th><th>${tr('printResultColumn')}</th><th>${tr('printNoteColumn')}</th></tr></thead><tbody>${flagged.map(point=>`<tr><td><small>${point.stepIndex+1}.${point.itemIndexInStep+1}</small> ${escapeHtml(driveItemText(point,'title'))}</td><td class="print-finding-status ${state.answers[point.key]}">${sourceStatus[state.answers[point.key]].icon} ${tr('status.'+state.answers[point.key])}</td><td data-print-note="${point.key}">${escapeHtml(noteValue(point.key))||tr('printNoNote')}</td></tr>`).join('')}</tbody></table>`:`<p class="print-no-findings">✓ ${tr('noFindings')}</p>`}</section>
    <section class="print-recommendation"><h2>${tr('printContactTitle')}</h2><p>${tr(recommendation+'Text')}</p><p class="print-recommendation-contact"><strong>OJ Gutachter · Larry O. Johnson</strong><br>${CONTACT.address} · Tel. ${CONTACT.landlineDisplay} / ${CONTACT.phoneDisplay}<br>${CONTACT.email} · www.oj-gutachter.de</p></section>
    <section class="print-results">${activeSteps().map((step,stepIndex)=>`${stepIndex===0?`<div class="print-results-start"><h2>${tr('printResultsTitle')}</h2>`:''}<section class="print-step-group"><table><colgroup><col class="col-point"><col class="col-result"><col class="col-note"></colgroup><thead><tr class="print-step-title"><th colspan="3"><h3>${stepIndex+1}. ${driveText(step,'title')}</h3></th></tr><tr><th>${tr('printPointColumn')}</th><th>${tr('printResultColumn')}</th><th>${tr('printNoteColumn')}</th></tr></thead><tbody>${step.itemIndexes.map((itemIndex,index)=>printPointRow({key:`${step.id}-${itemIndex}`,textKey:`${step.textKey}.items.${itemIndex}`},index)).join('')}</tbody></table></section>${stepIndex===0?'</div>':''}`).join('')}</section>
    <footer class="print-end-note"><strong>${tr('important')}</strong> ${tr('summaryLegal')}<br><span>${tr('printCreatedWith')} · ${printDate()}</span></footer>
  </article>`;
}
function printVehicleForm(){
  return `<section class="vehicle-data-form screen-summary"><h2>${tr('printVehicleData')} <span>(${tr('optional')})</span></h2><p>${tr('printOptionalHint')}</p><div class="vehicle-data-grid">${VEHICLE_FIELDS.map(field=>`<label for="vehicle-${field.key}">${tr(field.label)}<input id="vehicle-${field.key}" type="text" data-action="vehicle-field" data-field="${field.key}" value="${escapeHtml(vehicleValue(field.key))}" maxlength="160" autocomplete="off"></label>`).join('')}</div><label for="vehicle-general-notes">${tr('printGeneralNotes')}<textarea id="vehicle-general-notes" data-action="vehicle-notes" maxlength="1000" rows="3" placeholder="${tr('printNotePlaceholder')}">${escapeHtml(vehicleValue('generalNotes'))}</textarea></label></section>`;
}

function renderSummary(){
  if(!state.drivetrain){renderDrivetrainChoice();return;}
  const c=counts(), s=summaryStatus(), completed=c.ok+c.issue+c.unclear;
  const recommendation=c.issue>0?'recommendationIssue':c.unclear>0?'recommendationUnclear':'recommendationOk';
  app.innerHTML=`
    ${printReport(c,s,recommendation)}
    <section class="summary-hero screen-summary">
      <p class="eyebrow">${tr('personalSummary')}</p>
      <div class="status-light ${s.class}" aria-hidden="true">${s.icon}</div>
      <h1>${s.title}</h1><p class="summary-status-text">${s.text}</p>
      <p class="summary-drivetrain"><strong>${tr('drive.summaryLabel')}:</strong> ${driveLabel()} · ${c.total} ${tr('drive.points')}</p>
      <div class="score" aria-label="${tr('scoreLabel',{ok:c.ok,issue:c.issue,unclear:c.unclear})}"><span class="score-pill ok">✓ ${c.ok} ${tr('okAbbreviation')}</span><span class="score-pill issue">! ${c.issue} ${tr('issueAbbreviation')}</span><span class="score-pill unclear">? ${c.unclear} ${tr('unclearAbbreviation')}</span></div>
      ${completed<c.total?`<p class="local-notice">${tr('ratedOf',{done:completed,total:c.total})} <button type="button" class="button button-text" data-action="start">${tr('continueCheck')}</button></p>`:''}
    </section>
    <div class="summary-body screen-summary">
      <aside class="recommendation"><div class="recommendation-icon" aria-hidden="true">i</div><div><h2>${tr(recommendation+'Title')}</h2><p>${tr(recommendation+'Text')}</p></div></aside>
      <h2 class="findings-title">${tr('notesTitle')}</h2><p class="findings-sub">${tr('notesIntro')}</p>
      ${findings().join('')||`<div class="all-ok">✓ ${tr('noFindings')}</div>`}
      <p class="legal-note"><strong>${tr('important')}</strong> ${tr('summaryLegal')}</p>
      ${printVehicleForm()}
      <section class="after-purchase-card"><p class="eyebrow">${tr('carBought')}</p><h2>${tr('secureDates')}</h2><p>${tr('secureDatesText')}</p><button class="button button-secondary button-full" type="button" data-action="reminders">${tr('myCarReminders')} ${iconArrow()}</button></section>
      <div class="summary-actions">
        <a class="button button-primary button-full" href="${contactLink()}" data-action="contact">${tr('requestExpert')} ${iconArrow()}</a>
        <button type="button" class="button button-secondary button-full" data-action="print">${tr('printSummary')}</button>
        <button type="button" class="button button-secondary button-full" data-action="export-backup">${tr('backup.saveButton')}</button>
        <p class="backup-inline-tip">${tr('backup.tip')} <button type="button" class="button button-text inline-link" data-action="backup">${tr('backup.open')}</button></p>
        <button type="button" class="button button-text" data-action="start">${tr('editAnswers')}</button>
        <button type="button" class="button button-text" data-action="ask-reset">${tr('newCheck')}</button>
      </div>
    </div>`;
}
function contactLink(){return '#kontakt';}
function renderContact(){
  const c=counts();
  const accidentContact=contactOrigin==='reminders';
  const subject=tr(accidentContact?'accidentSubject':'checkSubject');
  const body=[...tr(accidentContact?'accidentEmail':'checkEmail',{ok:c.ok,issue:c.issue,unclear:c.unclear}),...(!accidentContact&&state.drivetrain?['',`${tr('drive.summaryLabel')}: ${driveLabel()}`]:[])].join('\n');
  const mailto=`mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  app.innerHTML=`
    <section class="contact-hero"><p class="eyebrow">${tr('independentInspection')}</p><h1>${accidentContact?tr('accidentHelp'):tr('requestExpert')}</h1><p>${accidentContact?tr('accidentContactIntro'):tr('checkContactIntro')}</p></section>
    <div class="contact-body">
      <h2>${tr('contactHeading')}</h2>
      <div class="contact-cards">
        <a class="contact-card" href="${CONTACT.phoneLink}"><div class="contact-card-icon" aria-hidden="true">☎</div><div><strong>${tr('callMobile')}</strong><span dir="ltr">${CONTACT.phoneDisplay}</span></div></a>
        <a class="contact-card" href="${CONTACT.landlineLink}"><div class="contact-card-icon" aria-hidden="true">☎</div><div><strong>${tr('callLandline')}</strong><span dir="ltr">${CONTACT.landlineDisplay}</span></div></a>
        <a class="contact-card" href="${mailto}"><div class="contact-card-icon" aria-hidden="true">@</div><div><strong>${tr('prepareEmail')}</strong><span dir="ltr">${CONTACT.email}</span></div></a>
      </div>
      <p class="contact-note">${tr('contactNoteStart',{damage:accidentContact?tr('damageAddition'):''})}<strong>${tr('contactNoteWarning')}</strong></p>
      <p class="contact-address"><strong>Larry O. Johnson · ${tr('profession')}</strong><br><span lang="de">${CONTACT.address}</span><br><a href="${CONTACT.website}" target="_blank" rel="noopener noreferrer">www.oj-gutachter.de</a></p>
      <p class="local-notice">${accidentContact?tr('localDetails'):tr('localAnswersPdf')}</p>
      <button type="button" class="button button-secondary button-full close-bottom" data-action="back-summary"><span aria-hidden="true">${currentLanguage==='ar'?'→':'←'}</span> ${accidentContact?tr('backToReminders'):tr('backToSummary')}</button>
    </div>`;
}
function renderPrivacy(){
  const sections=tr('legalSections');
  app.innerHTML=`
    <article class="legal-page"><button type="button" class="route-back" data-action="back"><span aria-hidden="true">${currentLanguage==='ar'?'→':'←'}</span> ${tr('back')}</button><p class="eyebrow">${tr('legalEyebrow')}</p><h1>${tr('privacyTitle')}</h1>
      ${sections.map((section,index)=>`<h2>${section.title}</h2>${section.paragraphs.map(text=>`<p>${index===2?text.split(tr('OJWebsiteLabel')).join(`<a href="https://www.oj-gutachter.de/datenschutz" target="_blank" rel="noopener noreferrer">OJ-Website</a>`):text}</p>`).join('')}`).join('')}
      <p class="legal-note">${tr('legalDisclaimer')}</p>
      <button type="button" class="button button-secondary button-full close-bottom" data-action="back"><span aria-hidden="true">${currentLanguage==='ar'?'→':'←'}</span> ${tr('back')}</button>
    </article>`;
}

function showToast(message){
  const toast=document.getElementById('toast');
  toast.textContent=message;toast.classList.add('visible');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),3500);
}
function handleAction(action,element){
  if(action==='start'){
    if(!state.startedAt) state.startedAt=new Date().toISOString();
    save();goTo('check');
  }else if(action==='vehicle-field'){
    if(!state.vehicle)state.vehicle={};
    const field=VEHICLE_FIELDS.find(entry=>entry.key===element.dataset.field);
    if(!field)return;
    const value=element.value.slice(0,160);
    if(value)state.vehicle[field.key]=value;else delete state.vehicle[field.key];
    save();
    const printNode=document.querySelector(`[data-print-vehicle="${field.key}"]`);
    if(printNode)printNode.innerHTML=printVehicleText(value);
  }else if(action==='vehicle-notes'){
    if(!state.vehicle)state.vehicle={};
    const value=element.value.slice(0,1000);
    if(value)state.vehicle.generalNotes=value;else delete state.vehicle.generalNotes;
    save();
    const printNode=document.querySelector('[data-print-general-notes]');
    if(printNode){printNode.textContent=value;printNode.parentElement.hidden=!value;}
  }else if(action==='point-note'){
    if(!state.notes)state.notes={};
    const key=element.dataset.key;
    if(!activePoints().some(point=>point.key===key))return;
    const value=element.value.slice(0,500);
    if(value)state.notes[key]=value;else delete state.notes[key];
    save();
    document.querySelectorAll(`[data-print-note="${key}"]`).forEach(node=>{node.textContent=value||tr('printNoNote');});
  }else if(action==='answer'){
    const key=element.dataset.key,value=element.dataset.value;
    if(!/^(?:\d+|ev|hy)-\d+$/.test(key)||!sourceStatus[value]||!activePoints().some(point=>point.key===key)) return;
    state.answers[key]=value;save();renderChecklist();
    document.querySelector(`[data-key="${key}"]`)?.focus();
  }else if(action==='next'){
    state.step=Math.min(state.step+1,activeSteps().length-1);save();goTo('check');
  }else if(action==='previous'){
    if(state.step===0){state.drivetrain=null;save();goTo('check');}
    else {state.step=Math.max(0,state.step-1);save();goTo('check');}
  }else if(action==='goto-step'){
    const step=Number(element.dataset.step);
    if(Number.isInteger(step)&&step>=0&&step<activeSteps().length){state.step=step;save();goTo('check');}
  }else if(action==='select-drive'){
    const drive=element.dataset.drive;
    if(!DRIVE_TYPES.includes(drive))return;
    state.drivetrain=drive;state.step=0;state.completedAt=null;
    if(typeof syncReminderDrivetrain==='function')syncReminderDrivetrain(drive);
    if(!state.startedAt)state.startedAt=new Date().toISOString();
    save();goTo('check');
  }else if(action==='choose-drive'){
    state.drivetrain=null;save();goTo('check');
  }else if(action==='summary'){
    if(isComplete()&&!state.completedAt) state.completedAt=new Date().toISOString();
    save();goTo('summary');
  }else if(action==='reminders'){
    goTo('reminders');
  }else if(action==='edit-reminders'){
    goTo('reminder-form');
  }else if(action==='home'){
    goTo('home');
  }else if(action==='contact'){
    contactOrigin=route==='reminders'?'reminders':'summary';
    goTo('contact');
  }else if(action==='ask-reset'){
    document.getElementById('resetDialog').showModal();
  }else if(action==='cancel-reset'){
    document.getElementById('resetDialog').close();
  }else if(action==='confirm-reset'){
    state=createState();save();document.getElementById('resetDialog').close();goTo('home');showToast(tr('resetDone'));
  }else if(action==='print'){
    window.print();
  }else if(action==='privacy'){
    goTo('privacy');
  }else if(action==='backup'){
    goTo('backup');
  }else if(action==='export-backup'){
    if(typeof exportBackup==='function')exportBackup();
  }else if(action==='restore-backup'){
    if(typeof pickBackupFile==='function')pickBackupFile();
  }else if(action==='appointment-field'){
    const appointment={...appointmentValue()};
    const field=element.dataset.field;
    if(field==='date'){appointment.date=isValidIsoDate(element.value)?element.value:'';if(!appointment.date)appointment.time='';}
    else if(field==='time'){appointment.time=/^([01]\d|2[0-3]):[0-5]\d$/.test(element.value)&&appointment.date?element.value:'';}
    else return;
    state.appointment=appointment;save();
    const timeInput=document.getElementById('appointmentTime');
    if(timeInput){timeInput.disabled=!appointment.date;if(!appointment.date)timeInput.value='';}
  }else if(action==='appointment-calendar'){
    const item=appointmentCalendarItem();
    if(!item){showToast(tr('appointment.missingDate'));document.getElementById('appointmentDate')?.focus();return;}
    if(typeof saveCalendarFile==='function')saveCalendarFile(item);
  }else if(action==='back-summary'){
    goTo(contactOrigin);
  }else if(action==='back'){
    goTo(['privacy','backup'].includes(previousRoute)?'home':previousRoute);
  }
}
function normalizedRoute(hash){
  if(hash==='#check')return 'check';
  if(hash==='#auswertung')return 'summary';
  if(hash==='#kontakt')return 'contact';
  if(hash==='#erinnerungen')return 'reminders';
  if(hash==='#erinnerungen-bearbeiten')return 'reminder-form';
  if(hash==='#hinweise')return 'privacy';
  if(hash==='#sicherung')return 'backup';
  return 'home';
}
document.addEventListener('click',event=>{
  const element=event.target.closest('[data-action]');
  // Eingabefelder reagieren über input/change; ein Klick darf z. B. den Datumswähler nicht blockieren.
  if(element&&['INPUT','TEXTAREA','SELECT'].includes(element.tagName))return;
  if(element){event.preventDefault();handleAction(element.dataset.action,element);}
});
document.addEventListener('input',event=>{
  const element=event.target.closest('[data-action="vehicle-field"],[data-action="vehicle-notes"],[data-action="point-note"]');
  if(element)handleAction(element.dataset.action,element);
});
document.addEventListener('change',event=>{
  const element=event.target.closest('[data-action="appointment-field"]');
  if(element)handleAction('appointment-field',element);
});
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();goTo('home');});
document.getElementById('homeButton').addEventListener('click',()=>goTo('home'));
function goTo(next){
  const hashes={home:'',check:'check',summary:'auswertung',contact:'kontakt',reminders:'erinnerungen','reminder-form':'erinnerungen-bearbeiten',privacy:'hinweise',backup:'sicherung'};
  const hash=hashes[next]||'';
  const url=hash?'#'+hash:location.pathname+location.search;
  if(location.hash!==hash) history.pushState({route:next},'',url);
  setRoute(next);
}
window.addEventListener('popstate',()=>setRoute(normalizedRoute(location.hash)));
window.addEventListener('hashchange',()=>{
  const next=normalizedRoute(location.hash);
  if(next!==route) setRoute(next);
});
document.getElementById('resetDialog').addEventListener('click',event=>{
  if(event.target===event.currentTarget) event.currentTarget.close();
});
function cssString(value){return '"'+String(value).replace(/\\/g,'\\\\').replace(/"/g,'\\"').replace(/\n/g,' ')+'"';}
function preparePrintReport(){
  // Fußzeile über CSS-Seitenränder: Text und echte Seitenzahlen auf jeder Seite.
  let style=document.getElementById('printPageStyle');
  if(!style){style=document.createElement('style');style.id='printPageStyle';document.head.appendChild(style);}
  const pageText=tr('printPage',{page:'\u0001',pages:'\u0002'}).split(/(\u0001|\u0002)/).filter(Boolean).map(part=>part==='\u0001'?'counter(page)':part==='\u0002'?'counter(pages)':cssString(part)).join(' ');
  const rtl=currentLanguage==='ar';
  style.textContent=`@media print{@page{@bottom-left{content:${cssString(rtl?'':tr('summaryLegal'))} "\\A" ${cssString(rtl?'':tr('printCreatedWith'))};white-space:pre-wrap;font:6.6pt/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#4c4e52;vertical-align:top;padding-top:2.5mm;border-top:0.6pt solid #aaa5a8;width:150mm}@bottom-right{content:${pageText};font:7pt/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;color:#5D0C0D;font-weight:650;vertical-align:top;padding-top:2.5mm;border-top:0.6pt solid #aaa5a8;width:30mm;text-align:right}${rtl?`@bottom-left{content:${pageText}}@bottom-right{content:${cssString(tr('printCreatedWith'))};width:150mm}`:''}}}`;
}

window.addEventListener('beforeprint',preparePrintReport);
window.startOjCheck=()=>{
  load();
  if(typeof loadReminders==='function')loadReminders();
  if(state.drivetrain&&typeof syncReminderDrivetrain==='function')syncReminderDrivetrain(state.drivetrain);
  route=normalizedRoute(location.hash);
  render();
  preparePrintReport();
};
if(typeof loadReminders==='function')window.startOjCheck();
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='127.0.0.1'||location.hostname==='localhost')){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
}
