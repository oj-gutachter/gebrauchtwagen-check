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

const STEPS = [
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

const STATUS = {
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

function createState(){
  return {version:1, step:0, answers:{}, startedAt:null, completedAt:null};
}
function normalizeState(raw){
  const clean=createState();
  if(!raw || typeof raw!=='object') return clean;
  clean.step=Number.isInteger(raw.step) ? Math.min(Math.max(raw.step,0),STEPS.length-1) : 0;
  clean.startedAt=typeof raw.startedAt==='string' ? raw.startedAt : null;
  clean.completedAt=typeof raw.completedAt==='string' ? raw.completedAt : null;
  if(raw.answers && typeof raw.answers==='object'){
    STEPS.forEach((step,si)=>step.items.forEach((item,ii)=>{
      const value=raw.answers[`${si}-${ii}`];
      if(STATUS[value]) clean.answers[`${si}-${ii}`]=value;
    }));
  }
  return clean;
}
function load(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(raw) state=normalizeState(JSON.parse(raw));
  }catch(error){storageAvailable=false;}
}
function save(){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  catch(error){storageAvailable=false;showToast('Antworten konnten nicht dauerhaft gespeichert werden.');}
}
function counts(){
  const values=Object.values(state.answers);
  return {ok:values.filter(v=>v==='ok').length,issue:values.filter(v=>v==='issue').length,unclear:values.filter(v=>v==='unclear').length,total:STEPS.reduce((n,s)=>n+s.items.length,0)};
}
function isComplete(){return Object.keys(state.answers).length===counts().total;}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function iconArrow(){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>';}
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
  else renderHome();
}
function renderHome(){
  const answered=Object.keys(state.answers).length;
  const started=!!state.startedAt && answered>0;
  app.innerHTML=`
    <section class="hero">
      <p class="eyebrow">Ihr Check vor dem Autokauf</p>
      <h1>Klarer Blick.<span>Bessere Entscheidung.</span></h1>
      <p class="hero-copy">Gehen Sie Ihre Besichtigung Schritt für Schritt durch – mit den wichtigsten Prüfpunkten eines Kfz-Sachverständigen.</p>
      <button class="button button-light" type="button" data-action="start">${started?'Check fortsetzen':'Check starten'} ${iconArrow()}</button>
      ${started?`<button class="button second-action button-full" type="button" data-action="ask-reset">Neuen Check beginnen</button>`:''}
      <p class="hero-note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 10V7a6 6 0 0 1 12 0v3M5 10h14v11H5Z"/></svg> Kostenlos · Ohne Konto · Daten bleiben auf Ihrem Gerät</p>
    </section>
    <div class="home-content">
      <div class="section-heading"><h2>Das prüfen Sie</h2><span>8 Schritte · ${counts().total} Punkte</span></div>
      <ol class="steps-preview">
        ${STEPS.map((s,i)=>`<li><span class="step-num">${String(i+1).padStart(2,'0')}</span>${s.shortTitle}</li>`).join('')}
      </ol>
      <section class="reminder-home-card">
        <div class="reminder-home-icon" aria-hidden="true">✓</div>
        <div class="reminder-home-copy"><p class="eyebrow">Nach dem Autokauf</p><h2>Mein Auto – Erinnerungen</h2><p>TÜV, Reifenwechsel und Inspektion mit Übersicht und Kalenderdatei.</p></div>
        <button class="button button-secondary button-full" type="button" data-action="reminders">Termine ansehen ${iconArrow()}</button>
      </section>
      <aside class="trust-card">
        <div class="trust-card-icon" aria-hidden="true">i</div>
        <div><h2>Ihre Orientierung vor dem Kauf</h2><p>Notieren Sie Auffälligkeiten direkt am Fahrzeug. Die Ampel gibt Ihnen danach eine erste Einordnung und zeigt, welche Punkte Sie genauer prüfen lassen sollten.</p></div>
      </aside>
      ${started?`<p class="local-notice">${isComplete()?'Ihr Check ist vollständig.':'Ihre Antworten sind gespeichert.'} <button class="button button-text" type="button" data-action="summary">Zur Auswertung →</button></p>`:'<p class="local-notice">Auch offline nutzbar. Etwa 15–25 Minuten am Fahrzeug.</p>'}
    </div>`;
}
function renderChecklist(){
  const step=STEPS[state.step];
  const answeredInStep=step.items.filter((_,i)=>state.answers[`${state.step}-${i}`]).length;
  app.innerHTML=`
    <div class="progress-wrap">
      <div class="progress-top"><span>Schritt ${state.step+1} von ${STEPS.length}</span><strong>${answeredInStep} / ${step.items.length} geprüft</strong></div>
      <div class="progress-track" role="progressbar" aria-label="Fortschritt in diesem Schritt" aria-valuemin="0" aria-valuemax="${step.items.length}" aria-valuenow="${answeredInStep}"><div class="progress-bar" style="width:${answeredInStep/step.items.length*100}%"></div></div>
      <nav class="step-dots" aria-label="Zu einem Bearbeitungsschritt">${STEPS.map((s,i)=>`<button class="step-dot ${i===state.step?'current':''} ${s.items.every((_,ii)=>state.answers[`${i}-${ii}`])?'done':''}" type="button" data-action="goto-step" data-step="${i}" aria-label="Schritt ${i+1}: ${s.title}" ${i===state.step?'aria-current="step"':''}></button>`).join('')}</nav>
    </div>
    <div class="step-content">
      <div class="step-intro"><p class="eyebrow">Besichtigung · ${String(state.step+1).padStart(2,'0')}</p><h1>${step.title}</h1><p>${step.intro}</p></div>
      <aside class="expert-tip"><span class="tip-bulb" aria-hidden="true">✦</span><div><strong>Tipp vom Sachverständigen</strong><p>${step.tip}</p></div></aside>
      <div class="checklist">
        ${step.items.map((item,i)=>{
          const key=`${state.step}-${i}`, value=state.answers[key]||'';
          return `<article class="check-item" data-status="${value}">
            <div class="check-item-title"><span class="check-number">${String(i+1).padStart(2,'0')}</span><h2>${item.title}</h2></div>
            <p class="check-tip">${item.hint}</p>
            <div class="choice-group" role="group" aria-label="Bewertung: ${item.title}">
              ${Object.entries(STATUS).map(([status,meta])=>`<button class="choice" type="button" data-action="answer" data-key="${key}" data-value="${status}" aria-pressed="${value===status}"><span class="choice-symbol" aria-hidden="true">${meta.icon}</span>${meta.label}</button>`).join('')}
            </div>
          </article>`;
        }).join('')}
      </div>
      <p class="save-hint">${storageAvailable?'Antworten werden lokal auf diesem Gerät gespeichert':'Antworten nur in dieser Sitzung verfügbar'}</p>
      <div class="step-actions">
        <button type="button" class="button button-secondary" data-action="previous">← Zurück</button>
        ${state.step===STEPS.length-1?`<button type="button" class="button button-primary" data-action="summary">Auswertung ${iconArrow()}</button>`:`<button type="button" class="button button-primary" data-action="next">Weiter ${iconArrow()}</button>`}
        <button type="button" class="button button-text" data-action="summary">Auswertung ansehen${!isComplete()?' (noch nicht vollständig)':''}</button>
      </div>
    </div>`;
}
function summaryStatus(){
  const c=counts();
  if(c.issue>0) return {class:'red',icon:'!',title:'Bitte genauer prüfen lassen',text:`Sie haben ${c.issue} ${c.issue===1?'Auffälligkeit':'Auffälligkeiten'} festgehalten. Das ist ein Grund, vor dem Kauf genauer hinzusehen.${c.unclear?` Zusätzlich ${c.unclear===1?'ist':'sind'} ${c.unclear} ${c.unclear===1?'Punkt':'Punkte'} unklar.`:''}`};
  if(c.unclear>0) return {class:'amber',icon:'?',title:'Noch nicht alle Punkte sind klar',text:`Es ${c.unclear===1?'bleibt':'bleiben'} ${c.unclear} ${c.unclear===1?'Punkt':'Punkte'} unklar. Lassen Sie offene Fragen vor Ihrer Kaufentscheidung klären.`};
  if(c.ok===c.total) return {class:'green',icon:'✓',title:'Keine Auffälligkeiten notiert',text:'Bei Ihrer eigenen Besichtigung haben Sie keine Auffälligkeiten gemerkt. Verborgene Schäden können trotzdem vorhanden sein.'};
  return {class:'amber',icon:'…',title:'Ihr Check ist noch offen',text:'Bewerten Sie die restlichen Punkte für eine vollständige Orientierung. Sie können Ihre Antworten jederzeit fortsetzen.'};
}
function findings(){
  const output=[];
  STEPS.forEach((step,si)=>{
    const entries=step.items.map((item,ii)=>({item,key:`${si}-${ii}`})).filter(({key})=>state.answers[key]==='issue'||state.answers[key]==='unclear');
    if(!entries.length) return;
    output.push(`<section class="findings-group"><h3>${si+1}. ${step.title}</h3>${entries.map(({item,key})=>`<div class="finding ${state.answers[key]}"><span class="finding-label">${STATUS[state.answers[key]].short}</span><p>${item.title}</p></div>`).join('')}</section>`);
  });
  return output;
}
function renderSummary(){
  const c=counts(), s=summaryStatus(), completed=c.ok+c.issue+c.unclear;
  let recommendationTitle,recommendationText;
  if(c.issue>0){recommendationTitle='Ein unabhängiges Gutachten ist sinnvoll';recommendationText='Lassen Sie die Auffälligkeiten vor dem Kauf fachlich prüfen. So werden mögliche Schäden, Reparaturqualität und Folgekosten besser einschätzbar.';}
  else if(c.unclear>0){recommendationTitle='Offene Punkte fachlich klären';recommendationText='Ein unabhängiger Gebrauchtwagen-Check kann bei offenen Fragen helfen, bevor Sie einen Kaufvertrag unterschreiben.';}
  else {recommendationTitle='Sicherheit vor der Kaufentscheidung';recommendationText='Auch ohne festgehaltene Auffälligkeit kann ein unabhängiges Gutachten sinnvoll sein – besonders bei einem hohen Kaufpreis oder Zweifeln an der Historie.';}
  app.innerHTML=`
    <section class="summary-hero">
      <p class="eyebrow">Ihre persönliche Auswertung</p>
      <div class="status-light ${s.class}" aria-hidden="true">${s.icon}</div>
      <h1>${s.title}</h1><p>${s.text}</p>
      <div class="score" aria-label="${c.ok} in Ordnung, ${c.issue} auffällig, ${c.unclear} unklar"><span class="score-pill ok">✓ ${c.ok} OK</span><span class="score-pill issue">! ${c.issue} auffällig</span><span class="score-pill unclear">? ${c.unclear} unklar</span></div>
      ${completed<c.total?`<p class="local-notice">${completed} von ${c.total} Punkten bewertet. <button type="button" class="button button-text" data-action="start">Check fortsetzen</button></p>`:''}
    </section>
    <div class="summary-body">
      <aside class="recommendation"><div class="recommendation-icon" aria-hidden="true">i</div><div><h2>${recommendationTitle}</h2><p>${recommendationText}</p></div></aside>
      <h2 class="findings-title">Ihre Notizen im Überblick</h2><p class="findings-sub">Auffällige und unklare Punkte aus Ihrer Checkliste.</p>
      ${findings().join('')||'<div class="all-ok">✓ Sie haben bis jetzt keine Auffälligen oder unklaren Punkte notiert.</div>'}
      <p class="legal-note"><strong>Wichtig:</strong> Diese Auswertung ist Ihre persönliche Orientierung und ersetzt keine technische Untersuchung oder ein Gutachten. Eine grüne Ampel ist keine Garantie für Fehlerfreiheit oder Unfallfreiheit. Für die Einschätzung von Schäden und Fahrzeugwert ist eine fachliche Prüfung nötig.</p>
      <section class="after-purchase-card"><p class="eyebrow">Auto gekauft?</p><h2>Jetzt die nächsten Termine sichern</h2><p>Speichern Sie TÜV, Reifenwechsel und Inspektion lokal und übernehmen Sie die Termine in Ihren Kalender.</p><button class="button button-secondary button-full" type="button" data-action="reminders">Mein Auto – Erinnerungen ${iconArrow()}</button></section>
      <div class="summary-actions">
        <a class="button button-primary button-full" href="${contactLink()}" data-action="contact">Gutachten bei OJ anfragen ${iconArrow()}</a>
        <button type="button" class="button button-secondary button-full" data-action="print">Auswertung drucken / als PDF sichern</button>
        <button type="button" class="button button-text" data-action="start">Antworten bearbeiten</button>
        <button type="button" class="button button-text" data-action="ask-reset">Neuen Check starten</button>
      </div>
    </div>`;
}
function contactLink(){return '#kontakt';}
function renderContact(){
  const c=counts();
  const accidentContact=contactOrigin==='reminders';
  const subject=accidentContact?'Anfrage Unfall / Fahrzeugschaden':'Anfrage Gebrauchtwagen-Check';
  const body=accidentContact?['Guten Tag Herr Johnson,','','ich bitte um Ihre Hilfe bei einem Unfall oder Fahrzeugschaden.','','Fahrzeug:','Schaden / Was ist passiert:','Terminwunsch / Standort:','','Viele Grüße',''].join('\n'):['Guten Tag Herr Johnson,','','ich habe den OJ Gebrauchtwagen-Check genutzt und bitte um eine unabhängige Prüfung eines Fahrzeugs.','','Meine Auswertung:',`${c.ok} Punkte in Ordnung, ${c.issue} auffällig, ${c.unclear} unklar.`,'','Fahrzeug:','Terminwunsch / Standort:','','Viele Grüße',''].join('\n');
  const mailto=`mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  app.innerHTML=`
    <section class="contact-hero"><p class="eyebrow">Unabhängige Fahrzeugprüfung</p><h1>${accidentContact?'Unfall oder Schaden? OJ hilft':'Gutachten bei OJ anfragen'}</h1><p>${accidentContact?'Nach einem Unfall oder bei einem Fahrzeugschaden erhalten Sie eine unabhängige Einschätzung. Nehmen Sie direkt Kontakt auf.':'Sie möchten ein Fahrzeug vor dem Kauf prüfen lassen oder Ihre festgehaltenen Auffälligkeiten besprechen? Nehmen Sie direkt Kontakt auf.'}</p></section>
    <div class="contact-body">
      <h2>So erreichen Sie OJ Gutachter</h2>
      <div class="contact-cards">
        <a class="contact-card" href="${CONTACT.phoneLink}"><div class="contact-card-icon" aria-hidden="true">☎</div><div><strong>Mobil anrufen</strong><span>${CONTACT.phoneDisplay}</span></div></a>
        <a class="contact-card" href="${CONTACT.landlineLink}"><div class="contact-card-icon" aria-hidden="true">☎</div><div><strong>Festnetz anrufen</strong><span>${CONTACT.landlineDisplay}</span></div></a>
        <a class="contact-card" href="${mailto}"><div class="contact-card-icon" aria-hidden="true">@</div><div><strong>E-Mail vorbereiten</strong><span>${CONTACT.email}</span></div></a>
      </div>
      <p class="contact-note">Die E-Mail wird in Ihrer E-Mail-App als Entwurf geöffnet. Bitte ergänzen Sie Fahrzeug, Standort und Terminwunsch${accidentContact?' sowie eine kurze Schadenbeschreibung':''}. <strong>Vor dem Absenden prüfen – nichts wird automatisch übermittelt.</strong></p>
      <p class="contact-address"><strong>Larry O. Johnson · Kfz-Sachverständiger</strong><br>${CONTACT.address}<br><a href="${CONTACT.website}" target="_blank" rel="noopener noreferrer">www.oj-gutachter.de</a></p>
      <p class="local-notice">${accidentContact?'Ihre Angaben bleiben auf diesem Gerät.':'Ihre Antworten bleiben auf diesem Gerät. Ergänzen Sie die Ergebnisliste bei Bedarf als PDF zu Ihrer E-Mail.'}</p>
      <button type="button" class="button button-secondary button-full close-bottom" data-action="back-summary">${accidentContact?'← Zurück zu den Erinnerungen':'← Zurück zur Auswertung'}</button>
    </div>`;
}
function renderPrivacy(){
  app.innerHTML=`
    <article class="legal-page"><button type="button" class="route-back" data-action="back">← Zurück</button><p class="eyebrow">Testversion · Hinweise</p><h1>Datenschutz & rechtliche Hinweise</h1>
      <h2>Ihre Daten bleiben bei Ihnen</h2><p>Die Checkliste ist ohne Konto nutzbar. Sie enthält keine Werbung, kein Tracking und keine Analysewerkzeuge. Ihre Antworten und die Angaben unter „Mein Auto – Erinnerungen“ werden ausschließlich im lokalen Speicher Ihres Browsers (localStorage) auf diesem Gerät abgelegt und nicht automatisch an OJ Gutachter oder Dritte übertragen. Die Anwendung lädt keine externen Schriften, Bilder oder Skripte.</p><p>Bei „Neuen Check starten“ werden die Antworten der Kauf-Checkliste gelöscht. Die Auto-Erinnerungen lassen sich dort über „Bearbeiten“ und „Alle Angaben zu Mein Auto löschen“ separat entfernen. Sie können zusätzlich jederzeit die Website-Daten in Ihren Browser-Einstellungen löschen. Ausdrucke und PDF-Dateien liegen in Ihrem eigenen Verantwortungsbereich.</p>
      <h2>Erinnerungen und Kalender</h2><p>Die Termine und Kilometerstände werden nur auf diesem Gerät gespeichert. Der Kalender-Download erzeugt eine .ics-Datei mit einem Alarm vier Wochen vor dem Termin. Sie entscheiden selbst, ob Sie die Datei in eine Kalender-App importieren. Dort gelten dessen Datenschutzregeln. Ohne geöffnete App gibt es in dieser Testversion keine Erinnerung im Hintergrund.</p>
      <h2>Telefon und E-Mail</h2><p>Beim Anruf oder beim Anklicken der E-Mail-Adresse verlassen Sie den lokalen Ablauf der Anwendung. Beim E-Mail-Link öffnet sich Ihre E-Mail-App. Die Nachricht wird erst gesendet, wenn Sie dies dort selbst veranlassen. Es gilt dann auch die Datenschutzerklärung Ihres Anbieters. Die <a href="https://www.oj-gutachter.de/datenschutz" target="_blank" rel="noopener noreferrer">OJ-Website</a> enthält die weiteren Datenschutz- und Impressumsinformationen.</p>
      <h2>Kein Gutachten, keine Garantie</h2><p>Die Checkliste und die Ampel dienen nur der allgemeinen Orientierung bei einer eigenen Besichtigung. Sie ersetzen keine fachliche Untersuchung, keinen Fahrzeugtest und kein Gutachten. Die Auswertung stellt weder eine Garantie noch eine verbindliche Aussage über Unfallfreiheit, Fehlerfreiheit, Fahrzeugwert oder Verkehrssicherheit dar. Schäden und Mängel können auch bei einer grünen Ampel vorhanden sein.</p>
      <h2>Sicherheit bei der Besichtigung</h2><p>Prüfen Sie das Fahrzeug nur im sicheren Stand und nach Absprache mit dem Verkäufer. Keine heißen Bauteile, beweglichen Teile oder Drucksysteme berühren oder öffnen. Nicht unter ein Fahrzeug greifen oder klettern, das nicht fachgerecht gesichert ist. Probefahrten nur mit gültiger Zulassung, ausreichendem Versicherungsschutz und passender Fahrerlaubnis.</p>
      <h2>Gebrauchtwagen, keine Unfallmeldung</h2><p>Diese Testversion begleitet einen Gebrauchtwagenkauf. Für die Meldung eines Unfallschadens nutzen Sie bitte den separaten OJ Schadenmelder auf der OJ-Website.</p>
      <p class="legal-note">Rechtliche Hinweise sind allgemeine Informationen, keine Rechtsberatung im Einzelfall.</p>
      <button type="button" class="button button-secondary button-full close-bottom" data-action="back">Zurück</button>
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
  }else if(action==='answer'){
    const key=element.dataset.key,value=element.dataset.value;
    if(!/^\d+-\d+$/.test(key)||!STATUS[value]) return;
    state.answers[key]=value;save();renderChecklist();
    document.querySelector(`[data-key="${key}"]`)?.focus();
  }else if(action==='next'){
    state.step=Math.min(state.step+1,STEPS.length-1);save();goTo('check');
  }else if(action==='previous'){
    if(state.step===0) goTo('home');
    else {state.step=Math.max(0,state.step-1);save();goTo('check');}
  }else if(action==='goto-step'){
    const step=Number(element.dataset.step);
    if(Number.isInteger(step)&&step>=0&&step<STEPS.length){state.step=step;save();goTo('check');}
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
    state=createState();save();document.getElementById('resetDialog').close();goTo('home');showToast('Neuer Check – bisherige Antworten wurden gelöscht.');
  }else if(action==='print'){
    window.print();
  }else if(action==='privacy'){
    goTo('privacy');
  }else if(action==='back-summary'){
    goTo(contactOrigin);
  }else if(action==='back'){
    goTo(previousRoute==='privacy'?'home':previousRoute);
  }
}
function normalizedRoute(hash){
  if(hash==='#check')return 'check';
  if(hash==='#auswertung')return 'summary';
  if(hash==='#kontakt')return 'contact';
  if(hash==='#erinnerungen')return 'reminders';
  if(hash==='#erinnerungen-bearbeiten')return 'reminder-form';
  if(hash==='#hinweise')return 'privacy';
  return 'home';
}
document.addEventListener('click',event=>{
  const element=event.target.closest('[data-action]');
  if(element){event.preventDefault();handleAction(element.dataset.action,element);}
});
document.querySelector('.brand').addEventListener('click',event=>{event.preventDefault();goTo('home');});
document.getElementById('homeButton').addEventListener('click',()=>goTo('home'));
function goTo(next){
  const hashes={home:'',check:'check',summary:'auswertung',contact:'kontakt',reminders:'erinnerungen','reminder-form':'erinnerungen-bearbeiten',privacy:'hinweise'};
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
window.startOjCheck=()=>{
  load();
  if(typeof loadReminders==='function')loadReminders();
  route=normalizedRoute(location.hash);
  render();
};
if(typeof loadReminders==='function')window.startOjCheck();
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='127.0.0.1'||location.hostname==='localhost')){
  window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
}
