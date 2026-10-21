const POS=[["Keeper",50,9],["Laatste man",50,27],["Linksachter",20,43],["Rechtsachter",80,43],["Mid",50,59],["Linksvoor",20,76],["Rechtsvoor",80,76],["Spits",50,90]];
const KEY="khs_v1";
let S={names:Array.from({length:14},(_,i)=>i<12?"Speler "+(i+1):"Keeper "+(i-11)),pl:[0,1,2,3].map(()=>Array(8).fill(null)),sec:Array(14).fill(0),goals:[],logo:"",per:0,rem:1200,run:false,last:0};
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s&&s.names)S=Object.assign(S,s)}catch(e){}
const DEF_LOGO="logo.jpg";
if(!S.logo)S.logo=DEF_LOGO;
let sel=null,run=null,wl=null,view=S.per,pick=null;
const $=id=>document.getElementById(id);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const isK=i=>i>=12;
function kit(i,z=34){const c=isK(i)?"#111":"#7b2fa8";
return `<svg width="${z}" height="${z}" viewBox="0 0 34 34"><path d="M10 3l-8 6 4 6 3-2v9h16v-9l3 2 4-6-8-6c-1 3-3 4-7 4s-6-1-7-4z" fill="${c}" stroke="#fff" stroke-width="1"/><rect x="9" y="23" width="16" height="9" rx="2" fill="${isK(i)?"#111":"#1f8a3a"}" stroke="#fff" stroke-width="1"/></svg>`}
const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
function minute(){return S.per*20+Math.min(20,Math.floor((1200-S.rem)/60)+1)}
function render(){
 if(S.logo){$("logo").innerHTML='<img src="'+S.logo+'" alt="logo"><input id="lf" type="file" accept="image/*" hidden>';$("lf").onchange=up}
 $("clock").textContent=fmt(S.rem);
 $("per").textContent="Veld "+(S.per+1)+" · "+S.per*20+"–"+(S.per+1)*20+" min";
 $("tabs").innerHTML=S.pl.map((f,fi)=>`<button class="tab ${fi==view?"on":""}" data-v="${fi}">Veld ${fi+1}${fi==S.per?" ●":""}<small>${fi*20}–${fi*20+20}'</small></button>`).join("");
 $("fields").innerHTML=S.pl.map((f,fi)=>`<div class="fw ${fi==view?"vis":""}"><div class="fh ${fi==S.per?"act":""}" data-f="${fi}"><span>Veld ${fi+1}</span><span>${fi*20}–${fi*20+20} min</span></div><div class="pitch ${fi==S.per?"act":""}">`+
  POS.map((p,si)=>{const pi=f[si];return `<div class="slot" style="left:${p[1]}%;top:${p[2]}%" data-f="${fi}" data-s="${si}">`+
  (pi==null?'<div class="empty"></div>':`<span class="tok">${kit(pi)}<button class="g1 noprint" data-goal="${fi},${pi}">⚽</button></span><span class="lbl">${esc(S.names[pi])}</span>`)+
  `<span class="lbl" style="opacity:.85">${pi==null?p[0]:""}</span></div>`}).join("")+`</div></div>`).join("");
 $("bench").innerHTML=S.names.map((n,i)=>`<div class="b ${sel===i?"sel":""} ${S.pl[view].includes(i)?"on":""}"><div class="t" data-b="${i}">${kit(i)}<br><small>${isK(i)?"Keeper":"Speler"}</small></div><input value="${esc(n)}" data-n="${i}" maxlength="20"><small>⏱ <span data-min="${i}">${fmt(S.sec[i])}</span></small></div>`).join("");
 renderGoals();
}
function renderGoals(){
 $("goals").innerHTML=S.goals.length?"<tr><th>Min</th><th>Speler</th><th class=noprint></th></tr>"+S.goals.map((g,i)=>`<tr><td>${g.m}'</td><td>⚽ ${esc(S.names[g.p])}</td><td class="noprint"><button class="x" data-del="${i}">✕</button></td></tr>`).join(""):"<tr><td class='hint'>Nog geen doelpunten.</td></tr>";
}
document.addEventListener("click",e=>{
 const t=e.target;
 if(t.dataset.goal){const[f,p]=t.dataset.goal.split(",").map(Number);S.goals.push({p,m:f==S.per?minute():f*20+20});S.goals.sort((a,b)=>a.m-b.m);save();renderGoals();return}
 if(t.dataset.del){S.goals.splice(+t.dataset.del,1);save();renderGoals();return}
 const b=t.closest("[data-b]");if(b){sel=sel===+b.dataset.b?null:+b.dataset.b;render();return}
 const sl=t.closest(".slot");if(sl){const f=+sl.dataset.f,s=+sl.dataset.s;
  if(sel!=null){const row=S.pl[f];const o=row.indexOf(sel);if(o>-1)row[o]=null;row[s]=sel;sel=null}
  else{openPick(f,s);return}save();render();return}
 const v=t.closest("[data-v]");if(v){view=+v.dataset.v;render();return}
 const pk=t.closest("[data-pick]");if(pk&&pick){const[f,s]=pick,i=+pk.dataset.pick,row=S.pl[f];
  if(i<0)row[s]=null;else{const o=row.indexOf(i);if(o>-1)row[o]=null;row[s]=i}
  $("pick").close();save();render();return}
 if(t.dataset.close||t.id=="pick"){$("pick").close();return}
 const fh=t.closest(".fh");if(fh&&!run){S.per=view=+fh.dataset.f;S.rem=1200;save();render()}
});
// Keuzelijst om een speler op een positie te zetten, zonder naar de bank te moeten scrollen
function openPick(f,s){
 pick=[f,s];const row=S.pl[f],cur=row[s];
 const ids=S.names.map((n,i)=>i);if(s==0)ids.sort((a,b)=>isK(b)-isK(a));
 $("pt").textContent="Veld "+(f+1)+" · "+POS[s][0];
 $("plist").innerHTML=(cur!=null?`<button class="pi o" data-pick="-1">✕ Positie leegmaken</button>`:"")+ids.map(i=>{const o=row.indexOf(i);
  return `<button class="pi ${i===cur?"cur":""}" data-pick="${i}">${kit(i,26)}<span>${esc(S.names[i])}</span><small>${o>-1?POS[o][0]:""}</small></button>`}).join("");
 $("pick").showModal();
}
document.addEventListener("change",e=>{if(e.target.dataset.n!=null){S.names[+e.target.dataset.n]=e.target.value||"Speler";save();render()}});
function up(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas");const k=Math.min(1,256/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);S.logo=c.toDataURL("image/png");save();render()};im.src=r.result};r.readAsDataURL(f)}
$("lf").onchange=up;
// Tijd wordt berekend uit de klok van het toestel, zodat ze blijft kloppen bij schermvergrendeling, app wisselen of herladen
function tick(){
 const n=Math.floor((Date.now()-S.last)/1000);
 for(let k=0;k<n&&run;k++){
  S.last+=1000;S.rem--;
  S.pl[S.per].forEach(p=>{if(p!=null)S.sec[p]++});
  if(S.rem<=0){stop();if(S.per<3){S.per++;S.rem=1200;view=S.per}else S.rem=0;render()}
 }
 if(n<1)return;
 $("clock").textContent=fmt(S.rem);
 document.querySelectorAll("[data-min]").forEach(el=>el.textContent=fmt(S.sec[+el.dataset.min]));
 save();
}
async function lock(){try{if(run&&!wl&&navigator.wakeLock){wl=await navigator.wakeLock.request("screen");wl.onrelease=()=>{wl=null}}}catch(e){}}
function loop(){run=setInterval(tick,250);lock()}
function stop(){clearInterval(run);run=null;S.run=false;if(wl)wl.release();save()}
$("go").onclick=()=>{if(!run&&S.rem>0){S.last=Date.now();S.run=true;save();loop()}};
document.addEventListener("visibilitychange",()=>{if(document.visibilityState=="visible"&&run){tick();lock()}});
$("pa").onclick=stop;
$("rs").onclick=()=>{if(confirm("Tijd, spelersminuten en doelpunten resetten? (opstelling en namen blijven)")){stop();S.per=0;S.rem=1200;S.sec=Array(14).fill(0);S.goals=[];save();render()}};
$("pr").onclick=()=>window.print();
render();
if(S.run&&S.rem>0){loop();tick()}else S.run=false;
