(()=>{
  const nativeNames={de:'Deutsch',en:'English',tr:'Türkçe',ar:'العربية',pl:'Polski',ru:'Русский'};
  const byId=id=>document.getElementById(id);
  const setText=(id,key)=>{byId(id).textContent=tr(key);};
  const setAria=(id,key)=>{byId(id).setAttribute('aria-label',tr(key));};
  window.syncOJThemeLabels=preference=>{
    const theme=tr('theme.'+preference);
    byId('themeButton').setAttribute('aria-label',tr('themeButtonLabel',{theme}));
    byId('themeButton').setAttribute('title',tr('themeShortLabel',{theme}));
    byId('footerThemeButton').textContent=tr('themeShortLabel',{theme});
  };
  function syncLanguage(){
    const lang=currentLanguage;
    document.documentElement.lang=lang;
    document.documentElement.dir=lang==='ar'?'rtl':'ltr';
    document.querySelector('meta[name="description"]').setAttribute('content',tr('metaDescription'));
    document.title='OJ Gebrauchtwagen-Check – '+tr('layoutPreviewTitle');
    byId('languageButton').textContent=nativeNames[lang];
    byId('languageButton').setAttribute('aria-label',tr('languageButtonLabel',{language:nativeNames[lang]}));
    byId('footerLanguageButton').textContent=tr('languageLabel')+': '+nativeNames[lang];
    setText('languageTitle','languageDialogTitle');setText('languageDescription','languageDialogDescription');
    setText('closeLanguageDialog','close');
    document.querySelector('.language-options').setAttribute('aria-label',tr('languageOptionsLabel'));
    const input=document.querySelector(`input[name="languageChoice"][value="${lang}"]`);
    if(input)input.checked=true;
    document.querySelector('.skip-link').textContent=tr('skipLink');
    document.querySelector('.brand').setAttribute('aria-label',tr('brandHomeLabel'));
    document.querySelector('.brand small').textContent=tr('appSubtitle');
    document.querySelector('.test-badge').textContent=tr('testVersion');
    byId('homeButton').setAttribute('aria-label',tr('homeLabel'));
    byId('homeButton').setAttribute('title',tr('homeLabel'));
    byId('footerClaim').textContent=tr('footerClaim');
    byId('footerPrivacyButton').textContent=tr('privacyLink');
    const noScript=byId('noScript');if(noScript)noScript.textContent=tr('noScript');
    byId('navCheckLabel').textContent=tr('navCheck');
    setAria('navCheck','navCheckLabel');setAria('navReminders','myCarReminders');
    setText('navRemindersLabel','navRemindersLabel');setAria('navContact','navContactLabel');setText('navContactLabel','navContact');
    byId('mainNavigation').setAttribute('aria-label',tr('mainNavigation'));
    setText('themeTitle','themeDialogTitle');setText('themeDescription','themeDescription');
    document.querySelector('.theme-options').setAttribute('aria-label',tr('themeOptionsLabel'));
    setText('themeAutoTitle','theme.auto');setText('themeLightTitle','theme.light');setText('themeDarkTitle','theme.dark');
    setText('themeAutoText','themeAutoText');setText('themeLightText','themeLightText');setText('themeDarkText','themeDarkText');
    setText('themeSavedNote','themeSavedNote');setText('closeThemeDialog','close');
    setText('resetTitle','resetTitle');setText('resetText','resetText');
    setText('keepAnswers','keepAnswers');setText('confirmReset','resetConfirm');

  }
  function setLanguage(language,persist=true){
    if(!OJ_LANGUAGES.includes(language))language='de';
    currentLanguage=language;
    if(persist){try{localStorage.setItem(OJ_LANGUAGE_KEY,language);}catch(_){}}
    syncLanguage();
    if(typeof syncOJThemeLabels==='function')syncOJThemeLabels(document.documentElement.dataset.theme||'auto');
    if(typeof render==='function')render();
  }
  const openDialog=()=>{
    syncLanguage();
    const radio=document.querySelector(`input[name="languageChoice"][value="${currentLanguage}"]`);
    byId('languageDialog').showModal();
    if(radio)radio.focus();
  };
  byId('languageButton').addEventListener('click',openDialog);byId('footerLanguageButton').addEventListener('click',openDialog);
  byId('closeLanguageDialog').addEventListener('click',()=>byId('languageDialog').close());
  document.querySelectorAll('input[name="languageChoice"]').forEach(input=>input.addEventListener('change',()=>setLanguage(input.value)));
  byId('languageDialog').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close();});
  window.addEventListener('storage',event=>{if(event.key===OJ_LANGUAGE_KEY)setLanguage(OJ_LANGUAGES.includes(event.newValue)?event.newValue:'de',false);});
  syncLanguage();
  window.selectOJLanguage=setLanguage;
})();
