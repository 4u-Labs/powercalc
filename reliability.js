(function(global){
'use strict';
const prefix='powercalc:';
const memory=new Map();let warned=false;
function storageError(){if(warned)return;warned=true;const show=()=>{const el=document.createElement('div');el.id='storage-error';el.setAttribute('role','alert');el.textContent='Não foi possível salvar neste navegador. Exporte o histórico antes de sair.';el.style.cssText='position:fixed;bottom:8px;left:8px;right:8px;z-index:99999;background:#612b24;color:white;padding:12px;border-radius:8px';document.body.append(el);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show,{once:true});else show();}
const key=k=>/^(keepai_|keep_ai_)/.test(k)?k:prefix+k;
global.PowerCalcSafeStorage={getItem(k){if(memory.has(k))return memory.get(k);try{return localStorage.getItem(key(k)) ?? localStorage.getItem(k) ?? memory.get(k) ?? null;}catch(e){storageError();return memory.get(k) ?? null;}},setItem(k,v){memory.set(k,String(v));try{localStorage.setItem(key(k),String(v));return true;}catch(e){storageError();return false;}},removeItem(k){memory.delete(k);try{localStorage.removeItem(key(k));localStorage.removeItem(k);}catch(e){storageError();}}};
function parseNumber(value,format='BR'){
 if(typeof value==='number')return Number.isFinite(value)?value:NaN;
 let s=String(value??'').trim().replace(/\u2212/g,'-');if(!s)return NaN;
 const decimal=format==='BR'?',':'.', group=format==='BR'?'.':',';
 let [mantissa,exponent,...rest]=s.toLowerCase().split('e');if(rest.length||exponent!==undefined&&!/^[+-]?\d+$/.test(exponent))return NaN;
 let sign='';if(/^[+-]/.test(mantissa)){sign=mantissa[0];mantissa=mantissa.slice(1);}
 const parts=mantissa.split(decimal);if(parts.length>2||parts[1]!==undefined&&!/^\d*$/.test(parts[1]))return NaN;
 let whole=parts[0];if(whole.includes(group)){const groups=whole.split(group);if(!/^\d{1,3}$/.test(groups[0])||groups.slice(1).some(g=>!/^\d{3}$/.test(g)))return NaN;whole=groups.join('');}
 if(!/^\d*$/.test(whole)||!whole&&!parts[1])return NaN;
 const n=Number(sign+(whole||'0')+(parts[1]!==undefined?'.'+parts[1]:'')+(exponent!==undefined?'e'+exponent:''));return Number.isFinite(n)?n:NaN;
}
function readField(el,format){if(!el)return NaN;const value=(el.tagName==='SELECT'||el.type==='number')?(el.value.trim()===''?NaN:parseNumber(el.value,'US')):parseNumber(el.value,format);if(/^med|^pedPeso$|^pedDose$/.test(el.id||'')&&value<0)return NaN;return value;}
function validateRates(rates,currencies){if(!rates||typeof rates!=='object')throw new Error('Resposta de cotações inválida');const result={};for(const currency of currencies){const rate=Number(rates[currency]);if(!Number.isFinite(rate)||rate<=0)throw new Error('Cotação inválida: '+currency);result[currency]=rate;}if(Math.abs(result.USD-1)>1e-8)throw new Error('Base da cotação inválida');return result;}
function validateHistory(data){if(!Array.isArray(data)||data.length>1000)throw new Error('Histórico inválido');return data.map(item=>{if(!item||typeof item.formula!=='string'||typeof item.result!=='string'||item.formula.length>10000||item.result.length>10000)throw new Error('Item de histórico inválido');return {formula:item.formula,result:item.result};}).slice(0,100);}
global.PowerCalcReliability={parseNumber,readField,validateRates,validateHistory};
})(window);
