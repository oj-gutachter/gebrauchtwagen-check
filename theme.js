'use strict';
(()=>{
  const STORAGE_KEY='oj-gebrauchtwagen-check.theme.v1';
  const valid=value=>['auto','light','dark'].includes(value);
  const system=window.matchMedia('(prefers-color-scheme: dark)');
  const root=document.documentElement;
  // In der nativen App gibt es keine Auswahl: sie folgt immer dem Hell/Dunkel-Modus des Telefons.
  // Eine früher gespeicherte Wahl bleibt im Speicher, wird aber nicht verwendet.
  let nativeApp=false;
  try{nativeApp=!!(window.Capacitor&&typeof Capacitor.isNativePlatform==='function'&&Capacitor.isNativePlatform());}catch(_){}
  let preference=nativeApp?'auto':(valid(root.dataset.theme)?root.dataset.theme:'auto');
  function apply(next,save=false){
    preference=valid(next)?next:'auto';
    const resolved=preference==='auto'?(system.matches?'dark':'light'):preference;
    root.dataset.theme=preference;
    root.dataset.resolvedTheme=resolved;
    document.getElementById('themeColor').setAttribute('content',resolved==='dark'?'#17161A':'#F4F4F6');
    document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]').setAttribute('content','default');
    const choice=document.querySelector(`input[name="themeChoice"][value="${preference}"]`);
    if(choice)choice.checked=true;
    if(save){try{localStorage.setItem(STORAGE_KEY,preference);}catch(_){}}
    if(typeof syncOJThemeLabels==='function')syncOJThemeLabels(preference);
  }
  function openDialog(){
    apply(preference);
    document.getElementById('themeDialog').showModal();
  }
  document.getElementById('themeButton').addEventListener('click',openDialog);
  document.getElementById('footerThemeButton').addEventListener('click',openDialog);
  document.getElementById('closeThemeDialog').addEventListener('click',()=>document.getElementById('themeDialog').close());
  document.querySelectorAll('input[name="themeChoice"]').forEach(input=>input.addEventListener('change',()=>apply(input.value,true)));
  document.getElementById('themeDialog').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close();});
  const systemChanged=()=>{if(preference==='auto')apply('auto');};
  if(typeof system.addEventListener==='function')system.addEventListener('change',systemChanged);
  else if(typeof system.addListener==='function')system.addListener(systemChanged);
  window.addEventListener('storage',event=>{if(!nativeApp&&event.key===STORAGE_KEY)apply(valid(event.newValue)?event.newValue:'auto');});
  apply(preference);
})();
