const POS=[["Keeper",50,9],["Laatste man",50,27],["Linksachter",20,43],["Rechtsachter",80,43],["Mid",50,59],["Linksvoor",20,76],["Rechtsvoor",80,76],["Spits",50,90]];
const KEY="khs_v1";
let S={names:Array.from({length:14},(_,i)=>i<12?"Speler "+(i+1):"Keeper "+(i-11)),pl:[0,1,2,3].map(()=>Array(8).fill(null)),sec:Array(14).fill(0),goals:[],logo:"",clk:[0,1,2,3].map(()=>({rem:1200,on:false,last:0}))};
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s&&s.names)S=Object.assign(S,s)}catch(e){}
// Oude versie had één klok voor alle velden: omzetten naar een klok per veld
if("per" in S){S.clk=S.clk.map((c,f)=>f<S.per?{rem:0,on:false,last:0}:f==S.per?{rem:S.rem,on:!!S.run&&S.rem>0,last:S.last}:c);delete S.per;delete S.rem;delete S.run;delete S.last}
const DEF_LOGO="logo.jpg";
if(!S.logo)S.logo=DEF_LOGO;
let sel=null,timer=null,wl=null,pick=null,view=Math.max(0,S.clk.findIndex(c=>c.on));
const $=id=>document.getElementById(id);
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const isK=i=>i>=12;
function kit(i,z=34){const c=isK(i)?"#111":"#7b2fa8";
return `<svg width="${z}" height="${z}" viewBox="0 0 34 34"><path d="M10 3l-8 6 4 6 3-2v9h16v-9l3 2 4-6-8-6c-1 3-3 4-7 4s-6-1-7-4z" fill="${c}" stroke="#fff" stroke-width="1"/><rect x="9" y="23" width="16" height="9" rx="2" fill="${isK(i)?"#111":"#1f8a3a"}" stroke="#fff" stroke-width="1"/></svg>`}
const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
const minute=f=>f*20+Math.min(20,Math.floor((1200-S.clk[f].rem)/60)+1);
const rng=f=>f*20+"–"+(f*20+20)+" min";
function render(){
 if(S.logo){$("logo").innerHTML='<img src="'+S.logo+'" alt="logo"><input id="lf" type="file" accept="image/*" hidden>';$("lf").onchange=up}
 const v=S.clk[view];
 $("per").textContent="Veld "+(view+1)+" · "+rng(view)+(v.on?" · loopt":"");
 $("go").disabled=v.on||v.rem<=0;$("pa").disabled=!v.on;
 $("tabs").innerHTML=S.pl.map((f,fi)=>`<button class="tab ${fi==view?"on":""} ${S.clk[fi].on?"run":""}" data-v="${fi}">Veld ${fi+1}${S.clk[fi].on?" ●":""}<small data-ck="${fi}"></small></button>`).join("");
 $("fields").innerHTML=S.pl.map((f,fi)=>{const c=S.clk[fi];return `<div class="fw ${fi==view?"vis":""}"><div class="fh ${c.on?"act":""}" data-v="${fi}"><span>Veld ${fi+1} <small>${rng(fi)}</small></span><span class="fc"><b data-ck="${fi}"></b><button class="cb ${c.on?"o":"g"}" data-tg="${fi}" title="${c.on?"Pauze":"Start"}" ${!c.on&&c.rem<=0?"disabled":""}>${c.on?"⏸":"▶"}</button><button class="cb o" data-rz="${fi}" title="Klok van dit veld op 20:00">↺</button></span></div><div class="pitch ${c.on?"act":""}">`+
  POS.map((p,si)=>{const pi=f[si];return `<div class="slot" style="left:${p[1]}%;top:${p[2]}%" data-f="${fi}" data-s="${si}">`+
  (pi==null?'<div class="empty"></div>':`<span class="tok">${kit(pi)}<button class="g1 noprint" data-goal="${fi},${pi}">⚽</button></span><span class="lbl">${esc(S.names[pi])}</span>`)+
  `<span class="lbl" style="opacity:.85">${pi==null?p[0]:""}</span></div>`}).join("")+`</div></div>`}).join("");
 $("bench").innerHTML=S.names.map((n,i)=>`<div class="b ${sel===i?"sel":""} ${S.pl[view].includes(i)?"on":""}"><div class="t" data-b="${i}">${kit(i)}<br><small>${isK(i)?"Keeper":"Speler"}</small></div><input value="${esc(n)}" data-n="${i}" maxlength="20"><small>⏱ <span data-min="${i}"></span></small></div>`).join("");
 paint();renderGoals();
}
// Alleen de tijden bijwerken, zodat een naam die je aan het typen bent niet verdwijnt
function paint(){
 $("clock").textContent=fmt(S.clk[view].rem);
 document.querySelectorAll("[data-ck]").forEach(el=>el.textContent=fmt(S.clk[+el.dataset.ck].rem));
 document.querySelectorAll("[data-min]").forEach(el=>el.textContent=fmt(S.sec[+el.dataset.min]));
}
function renderGoals(){
 $("goals").innerHTML=S.goals.length?"<tr><th>Min</th><th>Veld</th><th>Speler</th><th class=noprint></th></tr>"+S.goals.map((g,i)=>`<tr><td>${g.m}'</td><td>${g.f!=null?g.f+1:Math.min(4,Math.ceil(g.m/20))}</td><td>⚽ ${esc(S.names[g.p])}</td><td class="noprint"><button class="x" data-del="${i}">✕</button></td></tr>`).join(""):"<tr><td class='hint'>Nog geen doelpunten.</td></tr>";
}
document.addEventListener("click",e=>{
 const t=e.target;
 if(t.dataset.goal){const[f,p]=t.dataset.goal.split(",").map(Number);S.goals.push({p,f,m:minute(f)});S.goals.sort((a,b)=>a.m-b.m);save();renderGoals();return}
 if(t.dataset.del){S.goals.splice(+t.dataset.del,1);save();renderGoals();return}
 const b=t.closest("[data-b]");if(b){sel=sel===+b.dataset.b?null:+b.dataset.b;render();return}
 const sl=t.closest(".slot");if(sl){const f=+sl.dataset.f,s=+sl.dataset.s;
  if(sel!=null){const row=S.pl[f];const o=row.indexOf(sel);if(o>-1)row[o]=null;row[s]=sel;sel=null}
  else{openPick(f,s);return}save();render();return}
 const tg=t.closest("[data-tg]");if(tg){view=+tg.dataset.tg;toggle(view);return}
 const rz=t.closest("[data-rz]");if(rz){const f=view=+rz.dataset.rz,c=S.clk[f];if(c.on)tick();
  if(c.rem==1200||confirm("Klok van veld "+(f+1)+" staat op "+fmt(c.rem)+". Terug op 20:00 zetten?")){c.rem=1200;c.on=false;sync()}render();return}
 const v=t.closest("[data-v]");if(v){view=+v.dataset.v;render();return}
 const pk=t.closest("[data-pick]");if(pk&&pick){const[f,s]=pick,i=+pk.dataset.pick,row=S.pl[f];
  if(i<0)row[s]=null;else{const o=row.indexOf(i);if(o>-1)row[o]=null;row[s]=i}
  $("pick").close();save();render();return}
 if(t.dataset.close||t.id=="pick"){$("pick").close();return}
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
// Elk veld heeft een eigen klok; spelers krijgen minuten voor elk lopend veld waarop ze staan
function tick(){
 let ch=false,done=false;
 S.clk.forEach((c,f)=>{if(!c.on)return;const n=Math.floor((Date.now()-c.last)/1000);
  for(let k=0;k<n&&c.on;k++){c.last+=1000;c.rem--;S.pl[f].forEach(p=>{if(p!=null)S.sec[p]++});if(c.rem<=0){c.on=false;done=true}}
  if(n>0)ch=true});
 if(done){try{navigator.vibrate&&navigator.vibrate([300,100,300])}catch(e){}sync();render()}
 else if(ch){paint();save()}
}
async function lock(){try{if(timer&&!wl&&navigator.wakeLock){wl=await navigator.wakeLock.request("screen");wl.onrelease=()=>{wl=null}}}catch(e){}}
// Eén interval zolang er minstens één veld loopt
function sync(){const any=S.clk.some(c=>c.on);
 if(any&&!timer){timer=setInterval(tick,250);lock()}
 if(!any&&timer){clearInterval(timer);timer=null;if(wl)wl.release()}
 save()}
function toggle(f){const c=S.clk[f];if(c.on){tick();c.on=false}else if(c.rem>0){c.on=true;c.last=Date.now()}sync();render()}
$("go").onclick=()=>{if(!S.clk[view].on)toggle(view)};
$("pa").onclick=()=>{if(S.clk[view].on)toggle(view)};
document.addEventListener("visibilitychange",()=>{if(document.visibilityState=="visible"&&timer){tick();lock()}});
$("rs").onclick=()=>{if(confirm("Alle klokken, spelersminuten en doelpunten resetten? (opstelling en namen blijven)")){S.clk.forEach(c=>{c.rem=1200;c.on=false});sync();S.sec=Array(14).fill(0);S.goals=[];save();render()}};
$("pr").onclick=()=>window.print();
// Donkere modus: volgt het toestel tot je zelf kiest
const dark=matchMedia("(prefers-color-scheme: dark)");
function theme(){const t=S.theme||(dark.matches?"dark":"light");document.documentElement.dataset.theme=t;$("th").textContent=t=="dark"?"☀️":"🌙"}
$("th").onclick=()=>{S.theme=document.documentElement.dataset.theme=="dark"?"light":"dark";save();theme()};
dark.addEventListener("change",theme);theme();
render();
sync();tick();
