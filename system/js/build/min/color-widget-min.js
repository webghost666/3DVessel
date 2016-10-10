!function e(o,t,r){function n(a,s){if(!t[a]){if(!o[a]){var l="function"==typeof require&&require;if(!s&&l)return l(a,!0);if(i)return i(a,!0);var d=new Error("Cannot find module '"+a+"'");throw d.code="MODULE_NOT_FOUND",d}var c=t[a]={exports:{}};o[a][0].call(c.exports,function(e){var t=o[a][1][e];return n(t?t:e)},c,c.exports,e,o,t,r)}return t[a].exports}for(var i="function"==typeof require&&require,a=0;a<r.length;a++)n(r[a]);return n}({1:[function(e,o,t){"use strict";var r=e("../colors/colors-widget.js");window.appColorsWidget=r.ColorsWidget},{"../colors/colors-widget.js":2}],2:[function(e,o,t){"use strict";function r(e,o){if(!(e instanceof o))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var n=function(){function e(e,o){for(var t=0;t<o.length;t++){var r=o[t];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}return function(o,t,r){return t&&e(o.prototype,t),r&&e(o,r),o}}(),i=e("../utils/js-helpers.js"),a=e("../utils/dom-utilities.js"),s=e("../core/i18labels.js"),l=function(){function e(o,t){var n=arguments.length<=2||void 0===arguments[2]?null:arguments[2];r(this,e);var i=this;this.isOpened=!1,this.btn=o,this.referenz=n,this.filters=t||{},this._currentOption=null,this._node=function(){var e=void 0,r=void 0,n=void 0,l=void 0,d=void 0,c=void 0,u=void 0,v=void 0,p=void 0,h=[],f=void 0,g=void 0,_=void 0,O=void 0,T=void 0,m="colors-container-"+Math.round(1e5*Math.random());e=document.createElement("div"),e.className="colors-container",e.innerHTML="<h2>"+s.CLICK_TO_CHANGE_COLORS+"</h2>",e.id=m,f=document.createElement("div"),f.className="colors-container-top",r=document.createElement("SELECT"),r.id=m+"-dropdwn",f.appendChild(r),_=[];for(v in t)_.push({name:t[v].name,key:v});for(_=_.sort(function(e,o){return e.name>=o.name?1:-1}),O=0,T=_.length;T>O;O+=1)v=_[O].key,p=t[v],h.push("<option value='"+v+"'>"+p.name+"</option>");return r.innerHTML=h.join(""),l=document.createElement("button"),l.innerHTML="SAVE",f.appendChild(l),d=document.createElement("button"),d.innerHTML="CANCEL",f.appendChild(d),e.appendChild(f),n=document.createElement("ul"),n.className="colors-container-ulColors",n.id=m+"-ulColors",e.appendChild(n),c=document.createElement("div"),c.className="colors-container-colorPicker",c.id=m+"-colorPicker",e.appendChild(c),e.dropdwn=r,e.ulColors=n,e.colorPickerDiv=c,e.btnSave=l,e.btnCancel=d,e.colorsTemp={},document.body.appendChild(e),o&&(a.addEventLnr(o,"click",i.toggleHandler.bind(i)),a.addEventLnr(r,"change",i.dropFilterChanged.bind(i)),a.addEventLnr(d,"click",i.close.bind(i)),a.addEventLnr(l,"click",i.saveColors.bind(i)),a.addEventLnr(n,"click",i.selectOption.bind(i))),e}(),this.onToggled=null,this.onSaved=null,this.postUrl=null,this._jsonColors={}}return n(e,[{key:"mergeColorSettings",value:function o(e){var o=e,t=void 0,r=void 0,n=void 0,i=this.filters,a=void 0,l=void 0;if("String"==typeof e&&(o=JSON.parse(e)),!o.colors)return void console.warn(s.NO_COLOR_SETTINGS);for(t in o.colors)a=t.split("___"),i[a[0]]&&i[a[0]].obs.hasOwnProperty(a[1])&&(r=o.colors[t],i[a[0]].obs[a[1]].color=r,i[a[0]].obs[a[1]].hexColor=parseInt(r.replace(/^#/,""),16),i[a[0]].obs[a[1]].colorIsRandom=!1);this._jsonColors=o.colors}},{key:"toggleHandler",value:function t(e){this.toggle(!this.isOpened)}},{key:"close",value:function i(){this.toggle(!1)}},{key:"toggle",value:function l(){var e=arguments.length<=0||void 0===arguments[0]?!0:arguments[0],o=this.filters;return this._node.style.display=e?"block":"none",this.isOpened=e,e?(this._node.colorsTemp={},this.referenz&&""!==this.referenz.value&&o[this.referenz.value]&&(this._node.dropdwn.value=this.referenz.value),this.dropFilterChanged(),void(this.onToggled&&this.onToggled(!0))):void(this.onToggled&&this.onToggled(!1))}},{key:"_makeHeightVisible",value:function d(e){var o=Number(e),t=Math.floor(o),r=1.2*(o-t);return String(t+r).replace(".","'")+'"'}},{key:"dropFilterChanged",value:function c(){var e=this,o=[],t=void 0,r={0:"no",1:"yes"},n=this._node.dropdwn.value,i=this.filters[n],a=void 0,s=void 0,l=void 0,d=void 0,c=void 0,u=void 0,v=void 0;for(c=_.keys(i.obs).sort(),u=0,v=c.length;v>u;u+=1)t=c[u],l=e._node.colorsTemp[n+"___"+t]||i.obs[t].color,d="h"===n?e._makeHeightVisible(t):t,o.push("<li data-color='"+l+"' id='liColor_"+n+"___"+t+"'><span style='background:"+l+"'> </span>"+(i.tf?r[t]:d)+"&nbsp;</li>");this._node.ulColors.innerHTML=o.join(""),a=this._node.ulColors.getElementsByTagName("LI"),a&&0!==a.length&&(s=a[0],s.className="selected",this._currentOption=s,this._node.colorPickerJoe?this._node.colorPickerJoe.set(s.getAttribute("data-color")):(this._node.colorPickerJoe=colorjoe.rgb(this._node.colorPickerDiv,s.getAttribute("data-color")),this._node.colorPickerJoe.on("change",function(o){var t=e._currentOption.id.replace("liColor_","");e._currentOption.setAttribute("data-color",o.hex()),e._currentOption.getElementsByTagName("SPAN")[0].style.background=o.hex(),e._node.colorsTemp[t]=o.hex()})))}},{key:"selectOption",value:function u(e){var o=this,t=e.target,r=void 0,n=void 0,i=void 0;if("LI"===t.tagName&&(r=this._node.ulColors.getElementsByTagName("LI"),"selected"!==t.className)){for(n=0,i=r.length;i>n;n+=1)t!==r[n]&&(r[n].className="");setTimeout(function(){t.className="selected",o._node.colorPickerJoe.set(t.getAttribute("data-color"),!0),o._currentOption=t},150)}}},{key:"saveColors",value:function v(){var e=void 0,o=this._node.colorsTemp,t=this.filters,r={},n=[],i=void 0,a=void 0,s=void 0;for(e in o)i=e.split("___"),2===i.length&&(a=o[e],t[i[0]].obs[i[1]].color=a,t[i[0]].obs[i[1]].hexColor=parseInt(a.replace(/^#/,""),16),t[i[0]].obs[i[1]].colorIsRandom=!1,r[i[0]]||(r[i[0]]=!0),n.push({attributeKey:i[0],attributeValue:i[1],hexColor:a}));this.close(),this.onSaved&&this.onSaved(t,o,r),this.postUrl&&0!==n.length&&(s=new XMLHttpRequest,s.open("POST",this.postUrl),s.setRequestHeader("Content-Type","application/json"),s.onreadystatechange=function(){4===s.readyState&&200===s.status&&console.log(s.responseText)},s.send(JSON.stringify(n)))}},{key:"getColors",value:function p(){var e={},o=void 0,t=void 0,r=this.filters;for(o in r){e[o]={};for(t in r[o].obs)e[o][t]={color:r[o].obs[t].color,colorIsRandom:r[o].obs[t].colorIsRandom}}return e}}]),e}();t.ColorsWidget=l},{"../core/i18labels.js":3,"../utils/dom-utilities.js":4,"../utils/js-helpers.js":5}],3:[function(e,o,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r="Loading 3D Model...";t.LOADING_DATA=r;var n="Error: Missing data source.";t.INVALID_DATA_SOURCE=n;var i="Error while parsing the JSON file.";t.ERROR_PARSING_JSON=i;var a="Click on colors to change them";t.CLICK_TO_CHANGE_COLORS=a;var s="No color settings found. Will use random.";t.NO_COLOR_SETTINGS=s;var l="Please select the document options";t.PRINTOPTS_TITLE=l;var d="Orientation";t.PRINTOPTS_ORIENTATION=d;var c="Landscape";t.PRINTOPTS_ORIENTATION_LANDSCAPE=c;var u="Portrait";t.PRINTOPTS_ORIENTATION_PORTRAIT=u;var v="Printer DPI";t.PRINTOPTS_DPI=v;var p="Paper Size";t.PRINTOPTS_SIZE=p;var h="GENERATE PDF";t.PRINTOPTS_GO=h;var f="Bays per row";t.PRINTOPTS_PERROW=f;var g="Colour by";t.PRINTOPTS_COLORBY=g;var _="Generating pages, please wait...";t.PRINTOPTS_PAGEPROGRESS=_;var O="Sending pages, please wait...";t.PRINTOPTS_SENDINGPAGES=O;var T="Download PDF";t.PRINTOPTS_DOWNLOAD=T},{}],4:[function(e,o,t){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var r=function s(e){return e&&e.tagName&&("textarea"===e.tagName.toLowerCase()||"input"===e.tagName.toLowerCase()&&"text"===e.type.toLowerCase())};t.isInputOrTextarea=r;var n=function l(e){return"object"==typeof HTMLElement?id instanceof HTMLElement:"object"==typeof id&&1===id.nodeType&&"string"==typeof id.nodeName};t.isHtmlNode=n;var i=function d(e,o,t){window.attachEvent?(e["e"+o+t]=t,e[o+t]=function(){e["e"+o+t](window.event)},e.attachEvent("on"+o,e[o+t])):e.addEventListener(o,t,!1)};t.addEventLnr=i;var a=function c(e){if(window.Event&&"function"==typeof window.Event)return new Event(e);var o=document.createEvent("Event");return o.initEvent(e,!0,!0),o};t.addEventDsptchr=a},{}],5:[function(e,o,t){"use strict";function r(e,o,t){e?o.apply(null,arguments):t.apply(null,arguments)}function n(e,o){var t=!1;"#"==e[0]&&(e=e.slice(1),t=!0);var r=parseInt(e,16),n=(r>>16)+o;n>255?n=255:0>n&&(n=0);var i=(r>>8&255)+o;i>255?i=255:0>i&&(i=0);var a=(255&r)+o;return a>255?a=255:0>a&&(a=0),(t?"#":"")+(a|i<<8|n<<16).toString(16)}Object.defineProperty(t,"__esModule",{value:!0}),t.callOnCondition=r,t.lightenDarkenColor=n;var i=function h(e){return Array.isArray?Array.isArray(e):e instanceof Array};t.isArray=i;var a=function f(e,o){var t=void 0,r=JSON.parse(JSON.stringify(e));if(o)for(t in o)Object.prototype.hasOwnProperty.call(o,t)&&Object.prototype.hasOwnProperty.call(r,t)&&(r[t]=o[t]);return r};t.extend=a;var s=function g(e,o){return e-o};t.sortNumeric=s;var l=function _(e){var o=arguments.length<=1||void 0===arguments[1]?!0:arguments[1],t=arguments.length<=2||void 0===arguments[2]?!0:arguments[2],r=e;return o&&(r=r.replace(/^\s\s*/,"")),t&&(r=r.replace(/\s\s*$/,"")),r};t.trimString=l;var d=function O(e){var o=void 0,t=void 0,r=new Set;for(o=0,t=e.length;t>o;o+=1){var n=l(e[o]);r.has(n)||r.add(n)}return ouputSet};t.arrayToSet=d;var c=function T(e,o){var t=void 0,r=[];for(t in e)r.push(t);return o&&(r=r.sort(s)),r};t.objKeysToArray=c;var u=function m(e){var o=Number(e).toString(16);return o="000000".substr(0,6-o.length)+o,o.toUpperCase()};t.decimalToHex=u;var v=function y(e,o){var t="000"+String(e);return t.substr(t.length-o)};t.pad=v;var p=function N(){for(var e=document.location.search.split("+").join(" "),o={},t=void 0,r=/[?&]?([^=]+)=([^&]*)/g;t=r.exec(e);)o[decodeURIComponent(t[1])]=decodeURIComponent(t[2]);return o};t.getQueryParams=p},{}]},{},[1]);