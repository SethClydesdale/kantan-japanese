/**
 * [mkanki]{@link https://github.com/nornagon/mkanki}
 * @copyright Copyright (c) 2018 Jeremy Apthorp
 * @license AGPL-3.0 License
 * 
 * 
 * [genanki]{@link https://github.com/kerrickstaley/genanki}
 * @copyright Copyright (c) Kerrick Staley 2021
 * @license The MIT License
 * 
 * 
 * [genanki-js]{@link https://github.com/infinyte7/genanki-js}
 * @copyright Copyright (c) 2021 Mani
 * @license AGPL-3.0 License
 */ function ankiHash(t){let e=t.join("__"),$=sha256.create();$.update(e);let i=$.digest(),s=0n;for(let n=0;n<8;n++)s*=256n,s+=BigInt(i[n]);let r=[];for(;s>0;)r.push(BASE91_TABLE[s%91n]),s/=91n;return r.reverse().join("")}BASE91_TABLE=["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9","!","#","$","%","&","(",")","*","+",",","-",".","/",":",";","<","=",">","?","@","[","]","^","_","`","{","|","}","~"];const MODEL_STD=0,MODEL_CLOZE=1;class Model{constructor(t){this.props={...defaultModel,...t,flds:t.flds.map((t,e)=>({...defaultField,ord:e,...t})),tmpls:t.tmpls.map((t,e)=>({...defaultTemplate,ord:e,name:`Card ${e+1}`,...t})),mod:new Date().getTime()},this.fieldNameToOrd={},this.props.flds.forEach(t=>{this.fieldNameToOrd[t.name]=t.ord})}note(t,e,$=null){if(Array.isArray(t)){if(t.length!==this.props.flds.length)throw Error(`Expected ${this.props.flds.length} fields for model '${this.props.name}' but got ${t.length}`);return new Note(this,t,e,$)}{let i=Object.keys(t),s=[];return i.forEach(e=>{let $=this.fieldNameToOrd[e];if(null==$)throw Error(`Field '${e}' does not exist in the model`);s[$]=t[e]}),new Note(this,s,e,$)}}}class ClozeModel extends Model{constructor(t){super({type:MODEL_CLOZE,css:`
         .card {
           font-family: arial;
           font-size: 20px;
           text-align: center;
           color: black;
           background-color: white;
         }
 
         .cloze {
           font-weight: bold;
           color: blue;
         }
       `,tmpls:[{name:"Cloze",...t.tmpl}],...t})}}const defaultModel={sortf:0,did:1,latexPre:`\\documentclass[12pt]{article}
 \\special{papersize=3in,5in}
 \\usepackage[utf8]{inputenc}
 \\usepackage{amssymb,amsmath}
 \\pagestyle{empty}
 \\setlength{\\parindent}{0in}
 \\begin{document}`,latexPost:"\\end{document}",mod:0,usn:0,vers:[],type:MODEL_STD,css:`.card {
  font-family: arial;
  font-size: 20px;
  text-align: center;
  color: black;
  background-color: white;
 }`,tags:[]},defaultField={name:"",ord:null,sticky:!1,rtl:!1,font:"Arial",size:20,media:[]},defaultTemplate={name:"",ord:null,qfmt:"",afmt:"",did:null,bqfmt:"",bafmt:""},NEW_CARDS_DISTRIBUTE=0,NEW_CARDS_LAST=1,NEW_CARDS_FIRST=2,defaultConf={activeDecks:[1],curDeck:1,newSpread:NEW_CARDS_DISTRIBUTE,collapseTime:1200,timeLim:0,estTimes:!0,dueCounts:!0,curModel:null,nextPos:1,sortType:"noteFld",sortBackwards:!1,addToCur:!0,dayLearnFirst:!1},NEW_CARDS_RANDOM=0,NEW_CARDS_DUE=1,STARTING_FACTOR=2500,defaultDeckConf={name:"Default",new:{delays:[1,10],ints:[1,4,7],initialFactor:STARTING_FACTOR,separate:!0,order:NEW_CARDS_DUE,perDay:20,bury:!1},lapse:{delays:[10],mult:0,minInt:1,leechFails:8,leechAction:0},rev:{perDay:200,ease4:1.3,fuzz:.05,minSpace:1,ivlFct:1,maxIvl:36500,bury:!1,hardFactor:1.2},maxTaken:60,timer:0,autoplay:!0,replayq:!0,mod:0,usn:0},defaultDeck={newToday:[0,0],revToday:[0,0],lrnToday:[0,0],timeToday:[0,0],conf:1,usn:0,desc:"",dyn:0,collapsed:!1,extendNew:10,extendRev:50};class Deck{constructor(t,e,$=""){this.id=t,this.name=e,this.desc=$,this.notes=[]}addNote(t){this.notes.push(t)}}class Note{constructor(t,e,$=null,i=null){this.model=t,this.fields=e,this.tags=$,this._guid=i}get guid(){return this._guid?this._guid:ankiHash(this.fields)}get cards(){if(this.model.props.type===MODEL_STD){let t=t=>!t||0===t.toString().trim().length,e=[];for(let[$,i,s]of this.model.props.req){let n="any"===i?"some":"every";s[n](e=>!t(this.fields[e]))&&e.push($)}return e}{let r=new Set,o=[],a=/{{[^}]*?cloze:(?:[^}]?:)*(.+?)}}/g,l=/<%cloze:(.+?)%>/g,{qfmt:h}=this.model.props.tmpls[0],d;for(;d=a.exec(h);)o.push(d[1]);for(;d=l.exec(h);)o.push(d[1]);let c={};for(let _ of(this.model.props.flds.forEach((t,e)=>{c[t.name]=[e,t]}),o)){if(!(_ in c))continue;let x=c[_][0],u=/{{c(\d+)::.+?}}/gs;for(;d=u.exec(this.fields[x]);){let f=parseInt(d[1]);f>0&&r.add(f-1)}}return 0===r.size?[0]:Array.from(r)}}}class Package{constructor(){this.decks=[],this.media=[]}addDeck(t){this.decks.push(t)}addMedia(t,e){this.media.push({name:e,data:t})}addMediaFile(t,e=null){this.media.push({name:e||t,filename:t})}writeToFile(t){var e=new SQL.Database;e.run(APKG_SCHEMA),this.write(e);var $=new JSZip;let i=e.export(),s=new Uint8Array(i).buffer;$.file("collection.anki2",s);let n={};this.media.forEach((t,e)=>{null!=t.filename?$.file(e.toString(),t.filename):$.file(e.toString(),t.data),n[e]=t.name}),$.file("media",JSON.stringify(n)),$.generateAsync({type:"blob",mimeType:"application/apkg"}).then(function(e){saveAs(e,t)})}write(t){let e=new Date,$={},i={};i["1"]={...defaultDeck,id:1,name:"Default"},this.decks.forEach(t=>{t.notes.forEach(t=>$[t.model.props.id]=t.model.props),i[t.id]={...defaultDeck,id:t.id,name:t.name,desc:t.desc}});let s=[null,+e/1e3|0,+e,+e,11,0,0,0,JSON.stringify(defaultConf),JSON.stringify($),JSON.stringify(i),JSON.stringify({1:{id:1,...defaultDeckConf}}),JSON.stringify({})];t.prepare(`INSERT INTO col
         (id, crt, mod, scm, ver, dty, usn, ls, conf, models, decks, dconf, tags)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(s);let n=t.prepare(`INSERT INTO notes (id, guid, mid, mod, usn, tags, flds, sfld, csum, flags, data) 
        VALUES (null, ?, ?, ?, ?, ?, ?, ?, 0, 0, '')`),r=t.prepare(`INSERT INTO cards (id, nid, did, ord, mod, usn, type, queue, due, ivl, factor, reps, lapses, left, odue, odid, flags, data) 
        VALUES (null, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, '')`);for(let o of this.decks)for(let a of o.notes){var l=null==a.tags?"":a.tags.join(" ");n.run([a.guid,a.model.props.id,+e/1e3|0,-1,l,a.fields.join("\x1f"),0]);var h=t.exec("select last_insert_rowid();")[0].values[0][0];for(let d of a.cards)r.run([h,o.id,d,+e/1e3|0,-1,0,0])}}}!/**
 * [js-sha256]{@link https://github.com/emn178/js-sha256}
 *
 * @version 0.9.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */ function(){"use strict";var ERROR="input is invalid type",WINDOW="object"==typeof window,root=WINDOW?window:{};root.JS_SHA256_NO_WINDOW&&(WINDOW=!1);var WEB_WORKER=!WINDOW&&"object"==typeof self,NODE_JS=!root.JS_SHA256_NO_NODE_JS&&"object"==typeof process&&process.versions&&process.versions.node;NODE_JS?root=global:WEB_WORKER&&(root=self);var COMMON_JS=!root.JS_SHA256_NO_COMMON_JS&&"object"==typeof module&&module.exports,AMD="function"==typeof define&&define.amd,ARRAY_BUFFER=!root.JS_SHA256_NO_ARRAY_BUFFER&&"undefined"!=typeof ArrayBuffer,HEX_CHARS="0123456789abcdef".split(""),EXTRA=[-2147483648,8388608,32768,128],SHIFT=[24,16,8,0],K=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298],OUTPUT_TYPES=["hex","array","digest","arrayBuffer"],blocks=[];(root.JS_SHA256_NO_NODE_JS||!Array.isArray)&&(Array.isArray=function(t){return"[object Array]"===Object.prototype.toString.call(t)}),ARRAY_BUFFER&&(root.JS_SHA256_NO_ARRAY_BUFFER_IS_VIEW||!ArrayBuffer.isView)&&(ArrayBuffer.isView=function(t){return"object"==typeof t&&t.buffer&&t.buffer.constructor===ArrayBuffer});var createOutputMethod=function(t,e){return function($){return new Sha256(e,!0).update($)[t]()}},createMethod=function(t){var e=createOutputMethod("hex",t);NODE_JS&&(e=nodeWrap(e,t)),e.create=function(){return new Sha256(t)},e.update=function(t){return e.create().update(t)};for(var $=0;$<OUTPUT_TYPES.length;++$){var i=OUTPUT_TYPES[$];e[i]=createOutputMethod(i,t)}return e},nodeWrap=function(method,is224){var nodeMethod,crypto=eval("require('crypto')"),Buffer=eval("require('buffer').Buffer"),algorithm=is224?"sha224":"sha256";return function(t){if("string"==typeof t)return crypto.createHash(algorithm).update(t,"utf8").digest("hex");if(null==t)throw Error(ERROR);return t.constructor===ArrayBuffer&&(t=new Uint8Array(t)),Array.isArray(t)||ArrayBuffer.isView(t)||t.constructor===Buffer?crypto.createHash(algorithm).update(new Buffer(t)).digest("hex"):method(t)}},createHmacOutputMethod=function(t,e){return function($,i){return new HmacSha256($,e,!0).update(i)[t]()}},createHmacMethod=function(t){var e=createHmacOutputMethod("hex",t);e.create=function(e){return new HmacSha256(e,t)},e.update=function(t,$){return e.create(t).update($)};for(var $=0;$<OUTPUT_TYPES.length;++$){var i=OUTPUT_TYPES[$];e[i]=createHmacOutputMethod(i,t)}return e};function Sha256(t,e){e?(blocks[0]=blocks[16]=blocks[1]=blocks[2]=blocks[3]=blocks[4]=blocks[5]=blocks[6]=blocks[7]=blocks[8]=blocks[9]=blocks[10]=blocks[11]=blocks[12]=blocks[13]=blocks[14]=blocks[15]=0,this.blocks=blocks):this.blocks=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],t?(this.h0=3238371032,this.h1=914150663,this.h2=812702999,this.h3=4144912697,this.h4=4290775857,this.h5=1750603025,this.h6=1694076839,this.h7=3204075428):(this.h0=1779033703,this.h1=3144134277,this.h2=1013904242,this.h3=2773480762,this.h4=1359893119,this.h5=2600822924,this.h6=528734635,this.h7=1541459225),this.block=this.start=this.bytes=this.hBytes=0,this.finalized=this.hashed=!1,this.first=!0,this.is224=t}function HmacSha256(t,e,$){var i,s=typeof t;if("string"===s){var n,r=[],o=t.length,a=0;for(i=0;i<o;++i)(n=t.charCodeAt(i))<128?r[a++]=n:n<2048?(r[a++]=192|n>>6,r[a++]=128|63&n):n<55296||n>=57344?(r[a++]=224|n>>12,r[a++]=128|n>>6&63,r[a++]=128|63&n):(n=65536+((1023&n)<<10|1023&t.charCodeAt(++i)),r[a++]=240|n>>18,r[a++]=128|n>>12&63,r[a++]=128|n>>6&63,r[a++]=128|63&n);t=r}else if("object"===s){if(null===t)throw Error(ERROR);if(ARRAY_BUFFER&&t.constructor===ArrayBuffer)t=new Uint8Array(t);else if(!Array.isArray(t)&&(!ARRAY_BUFFER||!ArrayBuffer.isView(t)))throw Error(ERROR)}else throw Error(ERROR);t.length>64&&(t=new Sha256(e,!0).update(t).array());var l=[],h=[];for(i=0;i<64;++i){var d=t[i]||0;l[i]=92^d,h[i]=54^d}Sha256.call(this,e,$),this.update(h),this.oKeyPad=l,this.inner=!0,this.sharedMemory=$}Sha256.prototype.update=function(t){if(!this.finalized){var e,$=typeof t;if("string"!==$){if("object"===$){if(null===t)throw Error(ERROR);if(ARRAY_BUFFER&&t.constructor===ArrayBuffer)t=new Uint8Array(t);else if(!Array.isArray(t)&&(!ARRAY_BUFFER||!ArrayBuffer.isView(t)))throw Error(ERROR)}else throw Error(ERROR);e=!0}for(var i,s,n=0,r=t.length,o=this.blocks;n<r;){if(this.hashed&&(this.hashed=!1,o[0]=this.block,o[16]=o[1]=o[2]=o[3]=o[4]=o[5]=o[6]=o[7]=o[8]=o[9]=o[10]=o[11]=o[12]=o[13]=o[14]=o[15]=0),e)for(s=this.start;n<r&&s<64;++n)o[s>>2]|=t[n]<<SHIFT[3&s++];else for(s=this.start;n<r&&s<64;++n)(i=t.charCodeAt(n))<128?o[s>>2]|=i<<SHIFT[3&s++]:i<2048?(o[s>>2]|=(192|i>>6)<<SHIFT[3&s++],o[s>>2]|=(128|63&i)<<SHIFT[3&s++]):i<55296||i>=57344?(o[s>>2]|=(224|i>>12)<<SHIFT[3&s++],o[s>>2]|=(128|i>>6&63)<<SHIFT[3&s++],o[s>>2]|=(128|63&i)<<SHIFT[3&s++]):(i=65536+((1023&i)<<10|1023&t.charCodeAt(++n)),o[s>>2]|=(240|i>>18)<<SHIFT[3&s++],o[s>>2]|=(128|i>>12&63)<<SHIFT[3&s++],o[s>>2]|=(128|i>>6&63)<<SHIFT[3&s++],o[s>>2]|=(128|63&i)<<SHIFT[3&s++]);this.lastByteIndex=s,this.bytes+=s-this.start,s>=64?(this.block=o[16],this.start=s-64,this.hash(),this.hashed=!0):this.start=s}return this.bytes>4294967295&&(this.hBytes+=this.bytes/4294967296<<0,this.bytes=this.bytes%4294967296),this}},Sha256.prototype.finalize=function(){if(!this.finalized){this.finalized=!0;var t=this.blocks,e=this.lastByteIndex;t[16]=this.block,t[e>>2]|=EXTRA[3&e],this.block=t[16],e>=56&&(this.hashed||this.hash(),t[0]=this.block,t[16]=t[1]=t[2]=t[3]=t[4]=t[5]=t[6]=t[7]=t[8]=t[9]=t[10]=t[11]=t[12]=t[13]=t[14]=t[15]=0),t[14]=this.hBytes<<3|this.bytes>>>29,t[15]=this.bytes<<3,this.hash()}},Sha256.prototype.hash=function(){var t,e,$,i,s,n,r,o,a,l,h,d=this.h0,c=this.h1,_=this.h2,x=this.h3,u=this.h4,f=this.h5,p=this.h6,F=this.h7,y=this.blocks;for(t=16;t<64;++t)e=((s=y[t-15])>>>7|s<<25)^(s>>>18|s<<14)^s>>>3,$=((s=y[t-2])>>>17|s<<15)^(s>>>19|s<<13)^s>>>10,y[t]=y[t-16]+e+y[t-7]+$<<0;for(t=0,h=c&_;t<64;t+=4)this.first?(this.is224?(o=300032,F=(s=y[0]-1413257819)-150054599<<0,x=s+24177077<<0):(o=704751109,F=(s=y[0]-210244248)-1521486534<<0,x=s+143694565<<0),this.first=!1):(e=(d>>>2|d<<30)^(d>>>13|d<<19)^(d>>>22|d<<10),$=(u>>>6|u<<26)^(u>>>11|u<<21)^(u>>>25|u<<7),i=(o=d&c)^d&_^h,s=F+$+(r=u&f^~u&p)+K[t]+y[t],n=e+i,F=x+s<<0,x=s+n<<0),e=(x>>>2|x<<30)^(x>>>13|x<<19)^(x>>>22|x<<10),$=(F>>>6|F<<26)^(F>>>11|F<<21)^(F>>>25|F<<7),i=(a=x&d)^x&c^o,s=p+$+(r=F&u^~F&f)+K[t+1]+y[t+1],n=e+i,p=_+s<<0,e=((_=s+n<<0)>>>2|_<<30)^(_>>>13|_<<19)^(_>>>22|_<<10),$=(p>>>6|p<<26)^(p>>>11|p<<21)^(p>>>25|p<<7),i=(l=_&x)^_&d^a,s=f+$+(r=p&F^~p&u)+K[t+2]+y[t+2],n=e+i,f=c+s<<0,e=((c=s+n<<0)>>>2|c<<30)^(c>>>13|c<<19)^(c>>>22|c<<10),$=(f>>>6|f<<26)^(f>>>11|f<<21)^(f>>>25|f<<7),i=(h=c&_)^c&x^l,s=u+$+(r=f&p^~f&F)+K[t+3]+y[t+3],n=e+i,u=d+s<<0,d=s+n<<0;this.h0=this.h0+d<<0,this.h1=this.h1+c<<0,this.h2=this.h2+_<<0,this.h3=this.h3+x<<0,this.h4=this.h4+u<<0,this.h5=this.h5+f<<0,this.h6=this.h6+p<<0,this.h7=this.h7+F<<0},Sha256.prototype.hex=function(){this.finalize();var t=this.h0,e=this.h1,$=this.h2,i=this.h3,s=this.h4,n=this.h5,r=this.h6,o=this.h7,a=HEX_CHARS[t>>28&15]+HEX_CHARS[t>>24&15]+HEX_CHARS[t>>20&15]+HEX_CHARS[t>>16&15]+HEX_CHARS[t>>12&15]+HEX_CHARS[t>>8&15]+HEX_CHARS[t>>4&15]+HEX_CHARS[15&t]+HEX_CHARS[e>>28&15]+HEX_CHARS[e>>24&15]+HEX_CHARS[e>>20&15]+HEX_CHARS[e>>16&15]+HEX_CHARS[e>>12&15]+HEX_CHARS[e>>8&15]+HEX_CHARS[e>>4&15]+HEX_CHARS[15&e]+HEX_CHARS[$>>28&15]+HEX_CHARS[$>>24&15]+HEX_CHARS[$>>20&15]+HEX_CHARS[$>>16&15]+HEX_CHARS[$>>12&15]+HEX_CHARS[$>>8&15]+HEX_CHARS[$>>4&15]+HEX_CHARS[15&$]+HEX_CHARS[i>>28&15]+HEX_CHARS[i>>24&15]+HEX_CHARS[i>>20&15]+HEX_CHARS[i>>16&15]+HEX_CHARS[i>>12&15]+HEX_CHARS[i>>8&15]+HEX_CHARS[i>>4&15]+HEX_CHARS[15&i]+HEX_CHARS[s>>28&15]+HEX_CHARS[s>>24&15]+HEX_CHARS[s>>20&15]+HEX_CHARS[s>>16&15]+HEX_CHARS[s>>12&15]+HEX_CHARS[s>>8&15]+HEX_CHARS[s>>4&15]+HEX_CHARS[15&s]+HEX_CHARS[n>>28&15]+HEX_CHARS[n>>24&15]+HEX_CHARS[n>>20&15]+HEX_CHARS[n>>16&15]+HEX_CHARS[n>>12&15]+HEX_CHARS[n>>8&15]+HEX_CHARS[n>>4&15]+HEX_CHARS[15&n]+HEX_CHARS[r>>28&15]+HEX_CHARS[r>>24&15]+HEX_CHARS[r>>20&15]+HEX_CHARS[r>>16&15]+HEX_CHARS[r>>12&15]+HEX_CHARS[r>>8&15]+HEX_CHARS[r>>4&15]+HEX_CHARS[15&r];return this.is224||(a+=HEX_CHARS[o>>28&15]+HEX_CHARS[o>>24&15]+HEX_CHARS[o>>20&15]+HEX_CHARS[o>>16&15]+HEX_CHARS[o>>12&15]+HEX_CHARS[o>>8&15]+HEX_CHARS[o>>4&15]+HEX_CHARS[15&o]),a},Sha256.prototype.toString=Sha256.prototype.hex,Sha256.prototype.digest=function(){this.finalize();var t=this.h0,e=this.h1,$=this.h2,i=this.h3,s=this.h4,n=this.h5,r=this.h6,o=this.h7,a=[t>>24&255,t>>16&255,t>>8&255,255&t,e>>24&255,e>>16&255,e>>8&255,255&e,$>>24&255,$>>16&255,$>>8&255,255&$,i>>24&255,i>>16&255,i>>8&255,255&i,s>>24&255,s>>16&255,s>>8&255,255&s,n>>24&255,n>>16&255,n>>8&255,255&n,r>>24&255,r>>16&255,r>>8&255,255&r];return this.is224||a.push(o>>24&255,o>>16&255,o>>8&255,255&o),a},Sha256.prototype.array=Sha256.prototype.digest,Sha256.prototype.arrayBuffer=function(){this.finalize();var t=new ArrayBuffer(this.is224?28:32),e=new DataView(t);return e.setUint32(0,this.h0),e.setUint32(4,this.h1),e.setUint32(8,this.h2),e.setUint32(12,this.h3),e.setUint32(16,this.h4),e.setUint32(20,this.h5),e.setUint32(24,this.h6),this.is224||e.setUint32(28,this.h7),t},HmacSha256.prototype=new Sha256,HmacSha256.prototype.finalize=function(){if(Sha256.prototype.finalize.call(this),this.inner){this.inner=!1;var t=this.array();Sha256.call(this,this.is224,this.sharedMemory),this.update(this.oKeyPad),this.update(t),Sha256.prototype.finalize.call(this)}};var exports=createMethod();exports.sha256=exports,exports.sha224=createMethod(!0),exports.sha256.hmac=createHmacMethod(),exports.sha224.hmac=createHmacMethod(!0),COMMON_JS?module.exports=exports:(root.sha256=exports.sha256,root.sha224=exports.sha224,AMD&&define(function(){return exports}))}();/*
* [genanki]{@link https://github.com/kerrickstaley/genanki}
* @copyright Copyright (c) Kerrick Staley 2021
* @license The MIT License
*/ const APKG_SCHEMA=`
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;

CREATE TABLE col (
    id              integer primary key,
    crt             integer not null,
    mod             integer not null,
    scm             integer not null,
    ver             integer not null,
    dty             integer not null,
    usn             integer not null,
    ls              integer not null,
    conf            text not null,
    models          text not null,
    decks           text not null,
    dconf           text not null,
    tags            text not null
);
CREATE TABLE notes (
    id              integer primary key,   /* 0 */
    guid            text not null,         /* 1 */
    mid             integer not null,      /* 2 */
    mod             integer not null,      /* 3 */
    usn             integer not null,      /* 4 */
    tags            text not null,         /* 5 */
    flds            text not null,         /* 6 */
    sfld            integer not null,      /* 7 */
    csum            integer not null,      /* 8 */
    flags           integer not null,      /* 9 */
    data            text not null          /* 10 */
);
CREATE TABLE cards (
    id              integer primary key,   /* 0 */
    nid             integer not null,      /* 1 */
    did             integer not null,      /* 2 */
    ord             integer not null,      /* 3 */
    mod             integer not null,      /* 4 */
    usn             integer not null,      /* 5 */
    type            integer not null,      /* 6 */
    queue           integer not null,      /* 7 */
    due             integer not null,      /* 8 */
    ivl             integer not null,      /* 9 */
    factor          integer not null,      /* 10 */
    reps            integer not null,      /* 11 */
    lapses          integer not null,      /* 12 */
    left            integer not null,      /* 13 */
    odue            integer not null,      /* 14 */
    odid            integer not null,      /* 15 */
    flags           integer not null,      /* 16 */
    data            text not null          /* 17 */
);
CREATE TABLE revlog (
    id              integer primary key,
    cid             integer not null,
    usn             integer not null,
    ease            integer not null,
    ivl             integer not null,
    lastIvl         integer not null,
    factor          integer not null,
    time            integer not null,
    type            integer not null
);
CREATE TABLE graves (
    usn             integer not null,
    oid             integer not null,
    type            integer not null
);
CREATE INDEX ix_notes_usn on notes (usn);
CREATE INDEX ix_cards_usn on cards (usn);
CREATE INDEX ix_revlog_usn on revlog (usn);
CREATE INDEX ix_cards_nid on cards (nid);
CREATE INDEX ix_cards_sched on cards (did, queue, due);
CREATE INDEX ix_revlog_cid on revlog (cid);
CREATE INDEX ix_notes_csum on notes (csum);
COMMIT;
`;var APKG_COL=`
INSERT INTO col VALUES(
    null,
    1411124400,
    1425279151694,
    1425279151690,
    11,
    0,
    0,
    0,
    '{
        "activeDecks": [
            1
        ],
        "addToCur": true,
        "collapseTime": 1200,
        "curDeck": 1,
        "curModel": "1425279151691",
        "dueCounts": true,
        "estTimes": true,
        "newBury": true,
        "newSpread": 0,
        "nextPos": 1,
        "sortBackwards": false,
        "sortType": "noteFld",
        "timeLim": 0
    }',
    '{}',
    '{
        "1": {
            "collapsed": false,
            "conf": 1,
            "desc": "",
            "dyn": 0,
            "extendNew": 10,
            "extendRev": 50,
            "id": 1,
            "lrnToday": [
                0,
                0
            ],
            "mod": 1425279151,
            "name": "Default",
            "newToday": [
                0,
                0
            ],
            "revToday": [
                0,
                0
            ],
            "timeToday": [
                0,
                0
            ],
            "usn": 0
        }
    }',
    '{
        "1": {
            "autoplay": true,
            "id": 1,
            "lapse": {
                "delays": [
                    10
                ],
                "leechAction": 0,
                "leechFails": 8,
                "minInt": 1,
                "mult": 0
            },
            "maxTaken": 60,
            "mod": 0,
            "name": "Default",
            "new": {
                "bury": true,
                "delays": [
                    1,
                    10
                ],
                "initialFactor": 2500,
                "ints": [
                    1,
                    4,
                    7
                ],
                "order": 1,
                "perDay": 20,
                "separate": true
            },
            "replayq": true,
            "rev": {
                "bury": true,
                "ease4": 1.3,
                "fuzz": 0.05,
                "ivlFct": 1,
                "maxIvl": 36500,
                "minSpace": 1,
                "perDay": 100
            },
            "timer": 0,
            "usn": 0
        }
    }',
    '{}'
);
`;