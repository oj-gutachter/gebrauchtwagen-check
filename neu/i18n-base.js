'use strict';
const OJ_LANGUAGE_KEY='oj-gebrauchtwagen-check.language.v1';
const OJ_LANGUAGES=['de','en','tr','ar','pl','ru'];
let currentLanguage=OJ_LANGUAGES.includes(document.documentElement.lang)?document.documentElement.lang:'de';
const localizeDirection=value=>currentLanguage==='ar'?String(value).replace(/((?:\d+(?:[.,]\d+)*\s*(?:[A-Za-z]{1,5})?\s*(?:\/|-|–)\s*)+)(?=[^\s])/g,'\u2066$1\u2069'):String(value);
const tr=(key,vars={})=>{
 let text=(OJ_TRANSLATIONS[currentLanguage]&&OJ_TRANSLATIONS[currentLanguage][key])??OJ_TRANSLATIONS.de[key]??key;
 if(key==='legalSections')return text;
 if(Array.isArray(text))return text.map(line=>localizeDirection(String(line).replace(/\{(\w+)\}/g,(_,name)=>String(vars[name]??'{'+name+'}'))));
 return localizeDirection(String(text).replace(/\{(\w+)\}/g,(_,name)=>String(vars[name]??'{'+name+'}')));
};
const stepText=(step,field)=>tr(`steps.${step}.${field}`);
const itemText=(step,item,field)=>tr(`steps.${step}.items.${item}.${field}`);
