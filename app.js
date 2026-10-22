const POS8=[["Keeper",50,9],["Laatste man",50,27],["Linksachter",20,43],["Rechtsachter",80,43],["Mid",50,59],["Linksvoor",20,76],["Rechtsvoor",80,76],["Spits",50,90]];
// 11 spelers zoals op de schets: keeper, laatste man, daarna 3 rijen van 3 met de spits in de cirkel
const POS11=[["Keeper",50,9],["Laatste man",50,27],["Linksachter",18,40],["Centrale verdediger",50,40,"Centrale verd."],["Rechtsachter",82,40],["Linksmidden",18,60],["Mid",50,60],["Rechtsmidden",82,60],["Linksvoor",18,82],["Spits",50,86],["Rechtsvoor",82,82]];
const KEY="khs_v1";
const NP=14,N=NP+2; // 14 veldspelers + 2 keepers
const empty=n=>[0,1,2,3].map(()=>Array(n).fill(null));
let S={names:Array.from({length:N},(_,i)=>i<NP?"Speler "+(i+1):"Keeper "+(i-NP+1)),pl:empty(8),sec:Array(N).fill(0),fsec:[0,1,2,3].map(()=>Array(N).fill(0)),goals:[],og:[],subs:[],minMin:40,opp:"",date:"",fmt:8,lineups:{},xy:{},matches:{},logo:"",per:0,rem:1200,run:false,last:0};
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s&&s.names)S=Object.assign(S,s)}catch(e){}
// Oude versie had 12 veldspelers: keepers (12, 13) schuiven op naar 14, 15 en er komen 2 veldspelers bij
if(S.names.length==14){const m=i=>i==null?null:i<12?i+0:i+2,ins=a=>[...a.slice(0,12),0,0,...a.slice(12)];
 S.names=[...S.names.slice(0,12),"Speler 13","Speler 14",...S.names.slice(12)];S.sec=ins(S.sec);
 S.fsec=S.fsec.map(a=>a.length==14?ins(a):a);S.pl=S.pl.map(f=>f.map(m));S.goals.forEach(g=>g.p=m(g.p))}
const DEF_LOGO="logo.jpg";
if(!S.logo)S.logo=DEF_LOGO;
let POS=S.fmt==11?POS11:POS8;
let sel=null,run=null,wl=null,view=S.per,pick=null,move=false,drag=null;
const $=id=>document.getElementById(id);
// Elke wedstrijd wordt bewaard onder haar datum; de spelersnamen gelden voor alle wedstrijden
const MK=["opp","fmt","pl","lineups","xy","goals","og","subs","sec","fsec","per","rem"];
const snap=()=>JSON.parse(JSON.stringify(Object.fromEntries(MK.map(k=>[k,S[k]]))));
const save=()=>{if(S.date)S.matches[S.date]=snap();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const isK=i=>i>=NP;
function kit(i,z=34){const c=isK(i)?"#111":"#7b2fa8";
return `<svg width="${z}" height="${z}" viewBox="0 0 34 34"><path d="M10 3l-8 6 4 6 3-2v9h16v-9l3 2 4-6-8-6c-1 3-3 4-7 4s-6-1-7-4z" fill="${c}" stroke="#fff" stroke-width="1"/><rect x="9" y="23" width="16" height="9" rx="2" fill="${isK(i)?"#111":"#1f8a3a"}" stroke="#fff" stroke-width="1"/></svg>`}
const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
function minute(){return S.per*20+Math.min(20,Math.floor((1200-S.rem)/60)+1)}
const today=()=>{const d=new Date();return new Date(d-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
const shortDate=s=>{if(!s)return"";const[y,m,d]=s.split("-").map(Number);return new Date(y,m-1,d).toLocaleDateString("nl-BE",{weekday:"short",day:"numeric",month:"short",year:"numeric"})};
const oppName=()=>S.opp||"Tegenstander";
const score=()=>S.goals.length+" – "+S.og.length;
// Verwachte speeltijd: gespeeld op voorbije velden + rest van het lopende veld + geplande velden
function expSec(p){let t=0;for(let f=0;f<4;f++){const on=S.pl[f].includes(p);
 t+=f<S.per?S.fsec[f][p]:f==S.per?S.fsec[f][p]+(on?S.rem:0):on?1200:0}return t}
const fair=p=>{const e=expSec(p)/60,m=S.minMin;return e>=m?"ok":e>=m*.75?"warn":"low"};
function paintFair(){
 document.querySelectorAll("[data-bar]").forEach(el=>{const p=+el.dataset.bar,pl=S.sec[p]/48,ex=expSec(p)/48;
  el.className="ptb "+fair(p);el.querySelector("i").style.width=Math.min(100,pl)+"%";el.querySelector("u").style.width=Math.min(100,ex)+"%"});
 document.querySelectorAll("[data-exp]").forEach(el=>el.textContent=Math.round(expSec(+el.dataset.exp)/60)+"'");
 const low=S.names.map((n,i)=>i).filter(i=>fair(i)!="ok");
 $("fair").innerHTML=low.length?`⚠ Onder ${S.minMin} min: `+low.map(i=>`<span class="${fair(i)}">${esc(S.names[i])} ${Math.round(expSec(i)/60)}'</span>`).join(" "):`✓ Iedereen speelt minstens ${S.minMin} min`;
 $("fair").className="fair "+(low.length?"bad":"good")}
// Verschoven posities per spelvorm en per veld; anders de standaardplaats
const xyOf=f=>((S.xy[S.fmt]=S.xy[S.fmt]||[{},{},{},{}])[f]);
const at=(f,s)=>xyOf(f)[s]||[POS[s][1],POS[s][2]];
function render(){
 if(S.logo){$("logo").innerHTML='<img src="'+S.logo+'" alt="logo"><input id="lf" type="file" accept="image/*" hidden>';$("lf").onchange=up}
 $("clock").textContent=fmt(S.rem);
 $("per").textContent="Veld "+(S.per+1)+" · "+S.per*20+"–"+(S.per+1)*20+" min · "+score().replace(" – ","–");
 $("score").textContent=score();$("oppn").textContent=oppName();$("mdate").textContent=shortDate(S.date)||"Kies een datum";
 document.querySelectorAll("[data-fmt]").forEach(b=>b.classList.toggle("on",+b.dataset.fmt==S.fmt));
 document.body.classList.toggle("moving",move);document.body.classList.toggle("f11",S.fmt==11);
 $("mv").textContent=move?"✓ Klaar met verschuiven":"✥ Posities verschuiven";$("mv").className=move?"g":"o";
 $("tabs").innerHTML=S.pl.map((f,fi)=>`<button class="tab ${fi==view?"on":""}" data-v="${fi}">Veld ${fi+1}${fi==S.per?" ●":""}<small>${fi*20}–${fi*20+20}'</small></button>`).join("");
 $("fields").innerHTML=S.pl.map((f,fi)=>`<div class="fw ${fi==view?"vis":""}"><div class="fh ${fi==S.per?"act":""}"><span>Veld ${fi+1} <small>${fi*20}–${fi*20+20} min</small></span>${move?`<button class="sw" data-rxy="${fi}">↺ Standaardposities</button>`:fi==S.per?'<span class="now">● Nu bezig</span>':`<button class="sw" data-f="${fi}">⇄ Naar dit veld</button>`}</div><div class="pitch ${fi==S.per?"act":""}">`+
  POS.map((p,si)=>{const pi=f[si],[x,y]=at(fi,si);return `<div class="slot" style="left:${x}%;top:${y}%" data-f="${fi}" data-s="${si}">`+
  (pi==null?'<div class="empty"></div>':`<span class="tok">${kit(pi)}<button class="g1 noprint" data-goal="${fi},${pi}">⚽</button></span><span class="lbl">${esc(S.names[pi])}</span><span class="lbl fm" data-fm="${fi},${pi}">⏱ ${fmt(S.fsec[fi][pi])}</span>`)+
  `<span class="lbl" style="opacity:.85">${pi==null?p[3]||p[0]:""}</span></div>`}).join("")+`</div></div>`).join("");
 $("bench").innerHTML=S.names.map((n,i)=>`<div class="b ${sel===i?"sel":""} ${S.pl[view].includes(i)?"on":""}"><div class="t" data-b="${i}">${kit(i)}<br><small>${isK(i)?"Keeper":"Speler"}</small></div><input value="${esc(n)}" data-n="${i}" maxlength="20"><small>⏱ <span data-min="${i}">${fmt(S.sec[i])}</span> · verwacht <b data-exp="${i}"></b></small><span class="ptb" data-bar="${i}" title="Gespeeld (vol) en verwacht (licht) op 80 min; streepje = minimum"><u></u><i></i><em style="left:${S.minMin/.8}%"></em></span></div>`).join("");
 $("minmin").value=S.minMin;paintFair();renderGoals();
}
// Doelpunten van beide ploegen samen, met de stand na elk doelpunt
function renderGoals(){
 const all=[...S.goals.map((g,i)=>({...g,i,k:"g"})),...S.og.map((g,i)=>({...g,i,k:"o"})),...S.subs.map((g,i)=>({...g,i,k:"s"}))].sort((a,b)=>a.m-b.m||a.t-b.t);
 let h=0,a=0;const nm=i=>i==null?"–":esc(S.names[i]);
 $("goals").innerHTML=all.length?"<tr><th>Min</th><th>Gebeurtenis</th><th>Stand</th><th class=noprint></th></tr>"+all.map(g=>{
  if(g.k=="s")return `<tr class="sub"><td>${g.m}'</td><td>🔁 ${g.in!=null?`<b>${nm(g.in)}</b> erin`:""}${g.in!=null&&g.out!=null?" voor "+nm(g.out):g.out!=null?nm(g.out)+" eruit":""} <small>(${esc(g.pos)}, veld ${g.f+1})</small></td><td></td><td class="noprint"><button class="x" data-dsub="${g.i}" title="Uit het verloop halen">✕</button></td></tr>`;
  g.k=="g"?h++:a++;
  return `<tr class="${g.k=="g"?"":"opp"}"><td>${g.m}'</td><td>⚽ ${g.k=="g"?nm(g.p):esc(oppName())}</td><td>${h}–${a}</td><td class="noprint"><button class="x" data-${g.k=="g"?"del":"dog"}="${g.i}">✕</button></td></tr>`}).join(""):"<tr><td class='hint'>Nog geen doelpunten of wissels.</td></tr>";
 $("score").textContent=score();$("per").textContent="Veld "+(S.per+1)+" · "+S.per*20+"–"+(S.per+1)*20+" min · "+score().replace(" – ","–");
}
document.addEventListener("click",e=>{
 const t=e.target;
 if(t.dataset.goal&&!move){const[f,p]=t.dataset.goal.split(",").map(Number);S.goals.push({p,m:f==S.per?minute():f*20+20,t:Date.now()});save();renderGoals();return}
 if(t.dataset.del){S.goals.splice(+t.dataset.del,1);save();renderGoals();return}
 if(t.dataset.dog){S.og.splice(+t.dataset.dog,1);save();renderGoals();return}
 if(t.dataset.dsub){S.subs.splice(+t.dataset.dsub,1);save();renderGoals();return}
 const fb=t.closest("[data-fmt]");if(fb){setFmt(+fb.dataset.fmt);sel=null;save();render();return}
 const rx=t.closest("[data-rxy]");if(rx){const f=+rx.dataset.rxy;xyOf(f);S.xy[S.fmt][f]={};save();render();return}
 const b=t.closest("[data-b]");if(b){sel=sel===+b.dataset.b?null:+b.dataset.b;render();return}
 const sl=t.closest(".slot");if(sl){if(move)return;const f=+sl.dataset.f,s=+sl.dataset.s;
  if(sel!=null){const row=S.pl[f];const o=row.indexOf(sel);if(o>-1)row[o]=null;row[s]=sel;sel=null}
  else{openPick(f,s);return}save();render();return}
 const v=t.closest("[data-v]");if(v){view=+v.dataset.v;render();return}
 const pk=t.closest("[data-pick]");if(pk&&pick){const[f,s]=pick,i=+pk.dataset.pick,row=S.pl[f],prev=row[s];
  if(live(f)){if(run)tick();if(i!=prev&&(i<0||!row.includes(i)))S.subs.push({f,m:minute(),out:prev,in:i<0?null:i,pos:POS[s][0],t:Date.now()})}
  if(i<0)row[s]=null;else{const o=row.indexOf(i);if(o>-1)row[o]=null;row[s]=i}
  $("pick").close();save();render();return}
 if(t.dataset.close||t.id=="pick"){$("pick").close();return}
 if(t.dataset.sclose||t.id=="sdlg"){$("sdlg").close();return}
 const sw=t.closest(".sw");if(sw){if(goTo(+sw.dataset.f)){save();render()}}
});
// Posities verschuiven: sleep een positie naar een nieuwe plaats (alleen in verschuifmodus)
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
document.addEventListener("pointerdown",e=>{if(!move)return;const sl=e.target.closest(".slot");if(!sl)return;
 e.preventDefault();drag={sl,f:+sl.dataset.f,s:+sl.dataset.s,r:sl.parentElement.getBoundingClientRect()};sl.classList.add("drag")});
addEventListener("pointermove",e=>{if(!drag)return;e.preventDefault();
 drag.x=Math.round(clamp((e.clientX-drag.r.left)/drag.r.width*100,6,94));drag.y=Math.round(clamp((e.clientY-drag.r.top)/drag.r.height*100,5,95));
 drag.sl.style.left=drag.x+"%";drag.sl.style.top=drag.y+"%"},{passive:false});
addEventListener("pointerup",()=>{if(!drag)return;if(drag.x!=null){xyOf(drag.f)[drag.s]=[drag.x,drag.y];save()}drag.sl.classList.remove("drag");drag=null});
$("mv").onclick=()=>{move=!move;sel=null;render()};
// Klok naar een ander veld zetten; een lopende klok telt verder op het nieuwe veld
function goTo(f){if(run)tick();
 if(S.rem<1200&&!confirm("De klok van veld "+(S.per+1)+" staat op "+fmt(S.rem)+". Wisselen naar veld "+(f+1)+" en de klok op 20:00 zetten?"+(run?" De klok blijft lopen.":"")))return false;
 S.per=view=f;S.rem=1200;if(run)S.last=Date.now();return true}
// Een veld is "live" als zijn periode gestart en nog niet voorbij is: dan is een wijziging een wissel
const live=f=>f==S.per&&S.rem<1200&&S.rem>0;
// Keuzelijst om een speler op een positie te zetten, zonder naar de bank te moeten scrollen
function openPick(f,s){
 pick=[f,s];const row=S.pl[f],cur=row[s];
 const ids=S.names.map((n,i)=>i);
 // Bij een wissel eerst de spelers die nog niet op het veld staan, met de minste speeltijd bovenaan
 if(live(f))ids.sort((a,b)=>row.includes(a)-row.includes(b)||expSec(a)-expSec(b));
 if(s==0)ids.sort((a,b)=>isK(b)-isK(a));
 $("pt").textContent=(live(f)?"🔁 Wissel op "+minute()+"' · ":"")+"Veld "+(f+1)+" · "+POS[s][0];
 $("plist").innerHTML=(cur!=null?`<button class="pi o" data-pick="-1">✕ Positie leegmaken</button>`:"")+ids.map(i=>{const o=row.indexOf(i);
  return `<button class="pi ${i===cur?"cur":""}" data-pick="${i}">${kit(i,26)}<span>${esc(S.names[i])}<small class="pm ${fair(i)}">⏱ ${Math.round(S.sec[i]/60)}' · verwacht ${Math.round(expSec(i)/60)}'</small></span><small>${o>-1?POS[o][0]:""}</small></button>`}).join("");
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
  S.pl[S.per].forEach(p=>{if(p!=null){S.sec[p]++;S.fsec[S.per][p]++}});
  if(S.rem<=0){stop();if(S.per<3){S.per++;S.rem=1200;view=S.per}else S.rem=0;render()}
 }
 if(n<1)return;
 $("clock").textContent=fmt(S.rem);
 document.querySelectorAll("[data-min]").forEach(el=>el.textContent=fmt(S.sec[+el.dataset.min]));
 document.querySelectorAll("[data-fm]").forEach(el=>{const[f,p]=el.dataset.fm.split(",");el.textContent="⏱ "+fmt(S.fsec[f][p])});
 paintFair();save();
}
async function lock(){try{if(run&&!wl&&navigator.wakeLock){wl=await navigator.wakeLock.request("screen");wl.onrelease=()=>{wl=null}}}catch(e){}}
function loop(){run=setInterval(tick,250);lock()}
function stop(){clearInterval(run);run=null;S.run=false;if(wl)wl.release();save()}
$("go").onclick=()=>{if(!run&&view!=S.per&&!goTo(view))return;if(!run&&S.rem>0){S.last=Date.now();S.run=true;save();loop();render()}};
document.addEventListener("visibilitychange",()=>{if(document.visibilityState=="visible"&&run){tick();lock()}});
$("pa").onclick=()=>{stop();render()};
function resetMatch(){stop();S.per=view=0;S.rem=1200;S.sec=Array(N).fill(0);S.fsec=[0,1,2,3].map(()=>Array(N).fill(0));S.goals=[];S.og=[];S.subs=[]}
$("rs").onclick=()=>{if(confirm("Tijd, spelersminuten en doelpunten (ook van de tegenstander) resetten? (opstelling en namen blijven)")){resetMatch();save();render()}};
$("pr").onclick=()=>window.print();
$("minmin").onchange=e=>{S.minMin=Math.max(0,Math.min(80,Math.round(+e.target.value)||0));save();render()};
// Doelpunt van de tegenstander, op de minuut van de lopende klok
$("og").onclick=()=>{if(run)tick();S.og.push({f:S.per,m:minute(),t:Date.now()});save();renderGoals()};
// Spelvorm 8 of 11: elke spelvorm bewaart zijn eigen opstelling
function setFmt(n){if(n==S.fmt)return;S.lineups[S.fmt]=S.pl;S.fmt=n;S.pl=S.lineups[n]||empty(n);POS=n==11?POS11:POS8}
// Wedstrijdgegevens: verschijnt bij het opstarten en via de datumknop
// Datum typen (dd/mm/jjjj of ddmmjjjj) of aanklikken in een maandkalender
const iso2be=s=>s?s.split("-").reverse().join("/"):"";
const be2iso=s=>{const m=s.trim().match(/^(\d{1,2})[\/.\- ](\d{1,2})[\/.\- ](\d{4})$/)||s.trim().match(/^(\d{2})(\d{2})(\d{4})$/);if(!m)return"";
 const d=new Date(+m[3],m[2]-1,+m[1]);return d.getMonth()==m[2]-1&&d.getDate()==+m[1]?m[3]+"-"+m[2].padStart(2,"0")+"-"+m[1].padStart(2,"0"):""};
let calM,calSel="";
function drawCal(){const y=calM.getFullYear(),m=calM.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate();
 let h=`<div class="ch"><button type="button" class="o" data-cm="-1" title="Vorige maand">‹</button><b>${calM.toLocaleDateString("nl-BE",{month:"long",year:"numeric"})}</b><button type="button" class="o" data-cm="1" title="Volgende maand">›</button></div><div class="cg">`+["ma","di","wo","do","vr","za","zo"].map(d=>`<span>${d}</span>`).join("")+"<span></span>".repeat(first);
 for(let d=1;d<=days;d++){const iso=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");h+=`<button type="button" class="cd ${iso==calSel?"on":""} ${iso==today()?"td":""} ${S.matches[iso]?"has":""}" data-cd="${iso}">${d}</button>`}
 $("cal").innerHTML=h+"</div>";drawSaved()}
// Lijst met bewaarde wedstrijden, nieuwste eerst
function drawSaved(){const ds=Object.keys(S.matches).sort().reverse();
 $("saved").innerHTML=ds.length?"<b>Bewaarde wedstrijden</b>"+ds.map(d=>{const m=S.matches[d];
  return `<div class="sv ${d==calSel?"on":""}"><button type="button" class="svb" data-cd="${d}"><span>${m.goals.length}–${m.og.length}</span> ${shortDate(d).replace(/ \d{4}$/,"")} · ${esc(m.opp||"Tegenstander")}</button>${d==S.date?'<small>open</small>':`<button type="button" class="x" data-rm="${d}" title="Wedstrijd verwijderen">✕</button>`}</div>`}).join(""):""}
// Velden invullen met de bewaarde wedstrijd van die datum, of leeg voor een nieuwe datum
function prefill(iso){const m=S.matches[iso];if(m){$("fopp").value=m.opp||"";$("f"+(m.fmt||8)).checked=true}else if(iso!=S.date)$("fopp").value=""}
const showMonth=iso=>{const[y,m]=iso.split("-").map(Number);calM=new Date(y,m-1,1)};
$("cal").onclick=e=>{const b=e.target.closest("button");if(!b)return;
 if(b.dataset.cm){calM=new Date(calM.getFullYear(),calM.getMonth()+ +b.dataset.cm,1)}
 else if(b.dataset.cd){calSel=b.dataset.cd;showMonth(calSel);$("fdate").value=iso2be(calSel);$("fdate").classList.remove("bad");prefill(calSel)}
 else if(b.dataset.rm){if(!confirm("Wedstrijd van "+shortDate(b.dataset.rm)+" verwijderen?"))return;delete S.matches[b.dataset.rm];try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}drawCal()};
$("saved").onclick=$("cal").onclick;
$("fdate").oninput=()=>{const iso=be2iso($("fdate").value);$("fdate").classList.toggle("bad",!!$("fdate").value.trim()&&!iso);if(iso){calSel=iso;showMonth(iso);prefill(iso);drawCal()}};
function openMatch(first){
 calSel=S.date||today();$("fdate").value=iso2be(calSel);$("fdate").classList.remove("bad");showMonth(calSel);drawCal();$("fopp").value=S.opp;$("f"+S.fmt).checked=true;
 $("mtitle").textContent=first?"Welkom! Welke wedstrijd?":"Wedstrijd aanpassen";
 $("mdlg").showModal();
}
function applyMatch(){const v=$("fdate").value.trim(),iso=be2iso(v);
 if(v&&!iso){$("fdate").classList.add("bad");alert("Die datum klopt niet. Typ ze als dd/mm/jjjj, bv. 03/09/2026, of klik een dag aan in de kalender.");return false}
 if(iso&&iso!=S.date){save();stop();
  // Bewaarde wedstrijd openen, of een nieuwe beginnen met de huidige opstelling en alles op nul
  if(S.matches[iso]){Object.assign(S,JSON.parse(JSON.stringify(S.matches[iso])));POS=S.fmt==11?POS11:POS8;view=S.per;sel=null}else resetMatch()}
 S.date=iso;S.opp=$("fopp").value.trim().slice(0,30);setFmt($("f11").checked?11:8);return true}
$("fok").onclick=()=>{if(!applyMatch())return;$("mdlg").close();save();render()};
$("fnew").onclick=()=>{if(!be2iso($("fdate").value)&&$("fdate").value.trim())return applyMatch();if(!confirm("Wedstrijd op deze datum opnieuw beginnen? Klok, speelminuten en doelpunten gaan op nul. Namen en opstelling blijven."))return;applyMatch();resetMatch();$("mdlg").close();save();render()};
$("me").onclick=()=>openMatch(false);
// Seizoensoverzicht uit alle bewaarde wedstrijden
function season(){
 const ms=Object.entries(S.matches).sort();if(!S.date)ms.push(["",snap()]);
 const P=S.names.map(()=>({w:0,sec:0,g:0,pos:{}}));let W=0,G=0,V=0,gf=0,ga=0,rows="";
 for(const[d,m]of ms.slice().reverse()){const a=m.goals.length,b=m.og.length,played=a+b>0||m.sec.some(x=>x>0);
  if(played){gf+=a;ga+=b;a>b?W++:a==b?G++:V++}
  const R=!played?["gepland","pl"]:a>b?["W","w"]:a==b?["G","g"]:["V","v"];
  rows+=`<li><span class="res ${R[1]}">${R[0]}</span><span>${d?shortDate(d).replace(/ \d{4}$/,""):"Zonder datum"} · ${esc(m.opp||"Tegenstander")}</span><b>${played?a+"–"+b:""}</b></li>`;
  const PP=m.fmt==11?POS11:POS8;
  m.sec.forEach((s,i)=>{if(P[i]&&s>0){P[i].w++;P[i].sec+=s}});m.goals.forEach(x=>{if(P[x.p])P[x.p].g++});
  const add=(i,n)=>{if(P[i]!=null&&i!=null)P[i].pos[n]=(P[i].pos[n]||0)+1};
  m.pl.forEach((f,fi)=>f.forEach((i,s)=>{if(i!=null&&m.fsec[fi][i]>0)add(i,PP[s][0])}));(m.subs||[]).forEach(x=>{if(x.out!=null&&!m.pl[x.f].includes(x.out))add(x.out,x.pos)})}
 const max=Math.max(1,...P.map(x=>x.sec));
 const top=S.names.map((n,i)=>i).filter(i=>P[i].g>0).sort((a,b)=>P[b].g-P[a].g).slice(0,5);
 $("sbody").innerHTML=`<div class="sum"><div><b>${W+G+V}</b><small>gespeeld</small></div><div><b class="w">${W}</b><small>gewonnen</small></div><div><b class="g">${G}</b><small>gelijk</small></div><div><b class="v">${V}</b><small>verloren</small></div><div><b>${gf}–${ga}</b><small>doelsaldo ${gf-ga>0?"+":""}${gf-ga}</small></div></div>
 <h3>Uitslagen</h3>${rows?`<ul class="rl">${rows}</ul>`:"<p class='hint'>Nog geen wedstrijden bewaard. Kies een datum bij de wedstrijd om ze te bewaren.</p>"}
 ${top.length?`<h3>Topschutters</h3><ol class="ts">${top.map(i=>`<li>${esc(S.names[i])} <b>${P[i].g}</b></li>`).join("")}</ol>`:""}
 <h3>Spelers</h3><div class="tw"><table class="st"><tr><th>Speler</th><th>Wedstr.</th><th>Minuten</th><th>Gem.</th><th>⚽</th></tr>${S.names.map((n,i)=>{const x=P[i];
  const pos=Object.entries(x.pos).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>k+(v>1?" ("+v+"×)":"")).join(", ");
  return `<tr><td>${esc(n)}<small class="sp">${pos||"nog niet gespeeld"}</small></td><td>${x.w}</td><td><span class="mb2"><i style="width:${x.sec/max*100}%"></i></span>${Math.round(x.sec/60)}</td><td>${x.w?Math.round(x.sec/60/x.w):"–"}</td><td>${x.g||""}</td></tr>`}).join("")}</table></div>`;
 $("sdlg").showModal()}
$("st").onclick=season;
// Donkere modus: volgt het toestel tot je zelf kiest
const dark=matchMedia("(prefers-color-scheme: dark)");
function theme(){const t=S.theme||(dark.matches?"dark":"light");document.documentElement.dataset.theme=t;$("th").textContent=t=="dark"?"☀️":"🌙"}
$("th").onclick=()=>{S.theme=document.documentElement.dataset.theme=="dark"?"light":"dark";save();theme()};
dark.addEventListener("change",theme);theme();
// Opstelling delen via een link: namen, spelvorm, posities en wedstrijd zitten gecodeerd achter #o=
const b64=s=>btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const unb64=s=>new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0)));
$("sh").onclick=async()=>{
 const url=location.href.split("#")[0]+"#o="+b64(JSON.stringify({n:S.names,p:S.pl,f:S.fmt,xy:S.xy[S.fmt]||null,o:S.opp,d:S.date}));
 try{if(navigator.share){await navigator.share({title:"Opstelling K. Heibos",text:"Opstelling K. Heibos S.V. Kalmthout"+(S.opp?" tegen "+S.opp:"")+" – open de link om ze over te nemen:",url});return}}catch(e){if(e.name=="AbortError")return}
 try{await navigator.clipboard.writeText(url);alert("Link gekopieerd. Plak hem in WhatsApp, mail, …")}catch(e){prompt("Kopieer deze link:",url)}
};
function loadShared(){
 const m=location.hash.match(/^#o=([\w-]+)$/);if(!m)return false;
 history.replaceState(null,"",location.href.split("#")[0]);
 let d;try{d=JSON.parse(unb64(m[1]))}catch(e){}
 const n=d&&d.f==11?11:8;
 const ok=d&&Array.isArray(d.n)&&d.n.length==N&&Array.isArray(d.p)&&d.p.length==4&&d.p.every(f=>Array.isArray(f)&&f.length==n&&f.every(i=>i===null||Number.isInteger(i)&&i>=0&&i<N));
 if(!ok){alert("Deze gedeelde opstelling kan niet geopend worden.");return true}
 if(!confirm("Gedeelde opstelling overnemen"+(d.o?" (tegen "+d.o+")":"")+"? Je huidige namen en opstelling worden vervangen (klok, minuten en doelpunten blijven)."))return true;
 S.names=d.n.map(x=>String(x).slice(0,20)||"Speler");setFmt(n);S.pl=d.p;
 const xy=Array.isArray(d.xy)&&d.xy.length==4?d.xy.map(o=>{const r={};if(o&&typeof o=="object")for(const k in o){const v=o[k];if(+k>=0&&+k<n&&Array.isArray(v)&&v.length==2&&v.every(Number.isFinite))r[k]=[clamp(v[0],6,94),clamp(v[1],5,95)]}return r}):null;
 if(xy)S.xy[n]=xy;
 if(typeof d.o=="string")S.opp=d.o.slice(0,30);if(/^\d{4}-\d\d-\d\d$/.test(d.d||""))S.date=d.d;
 save();return true;
}
const shared=loadShared();
addEventListener("hashchange",()=>{loadShared();render()});
render();
if(S.run&&S.rem>0){loop();tick()}else{S.run=false;if(!shared)openMatch(true)}
