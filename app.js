let POS8=[["Keeper",50,9],["Laatste man",50,27],["Linksachter",20,43],["Rechtsachter",80,43],["Mid",50,59],["Linksvoor",20,76],["Rechtsvoor",80,76],["Spits",50,90]];
// 11 spelers zoals op de schets: keeper, laatste man, daarna 3 rijen van 3 met de spits in de cirkel
let POS11=[["Keeper",50,9],["Laatste man",50,27],["Linksachter",18,40],["Centrale verdediger",50,40,"Centrale verd."],["Rechtsachter",82,40],["Linksmidden",18,60],["Mid",50,60],["Rechtsmidden",82,60],["Linksvoor",18,82],["Spits",50,86],["Rechtsvoor",82,82]];
// Keeper onderaan, de ploeg speelt naar boven: zo staan links en rechts zoals de spelers ze zien
const flipY=a=>a.map(p=>{const q=p.slice();q[2]=100-p[2];return q});
POS8=flipY(POS8);POS11=flipY(POS11);
const KEY="khs_v1";
const NP=14,N=NP+2; // 14 veldspelers + 2 keepers
const empty=n=>[0,1,2,3].map(()=>Array(n).fill(null));
let S={names:Array.from({length:N},(_,i)=>i<NP?"Speler "+(i+1):"Keeper "+(i-NP+1)),pl:empty(8),sec:Array(N).fill(0),fsec:[0,1,2,3].map(()=>Array(N).fill(0)),goals:[],og:[],subs:[],opp:"",date:"",fmt:8,lineups:{},xy:{},matches:{},logo:"",per:0,rem:1200,run:false,last:0};
try{const s=JSON.parse(localStorage.getItem(KEY)||"null");if(s&&s.names)S=Object.assign(S,s)}catch(e){}
// Oude versie had 12 veldspelers: keepers (12, 13) schuiven op naar 14, 15 en er komen 2 veldspelers bij
if(S.names.length==14){const m=i=>i==null?null:i<12?i+0:i+2,ins=a=>[...a.slice(0,12),0,0,...a.slice(12)];
 S.names=[...S.names.slice(0,12),"Speler 13","Speler 14",...S.names.slice(12)];S.sec=ins(S.sec);
 S.fsec=S.fsec.map(a=>a.length==14?ins(a):a);S.pl=S.pl.map(f=>f.map(m));S.goals.forEach(g=>g.p=m(g.p))}
const flipXY=xy=>{for(const k in xy)(xy[k]||[]).forEach(o=>{for(const s in o)o[s][1]=100-o[s][1]})};
if(!S.flip){flipXY(S.xy);for(const d in S.matches)flipXY(S.matches[d].xy||{});S.flip=1}
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
// Speeltijd vergeleken met de rest van de ploeg: rood = speelde het minst, oranje = midden, groen = al veel
// Op hoeveel van de 4 velden een speler is opgesteld; kleur tegenover zijn groep (veldspelers of keepers)
const nf=i=>S.pl.filter(f=>f.includes(i)).length;
const dots=i=>S.pl.map(f=>f.includes(i)?"●":"○").join("");
function selLvl(i){const c=S.names.map((n,j)=>j).filter(j=>isK(j)==isK(i)).map(nf),mn=Math.min(...c),mx=Math.max(...c),v=nf(i);
 if(mx==mn)return v?"high":"none";const t=(v-mn)/(mx-mn);return t<1/3?"low":t>2/3?"high":"mid"}
function selSummary(){const fp=S.names.map((n,i)=>i).filter(i=>!isK(i)),mn=Math.min(...fp.map(nf)),mx=Math.max(...fp.map(nf));
 if(mx==0)return"Nog niemand opgesteld.";if(mn==mx)return`✓ Alle veldspelers staan op ${mn} van de 4 velden.`;
 return`Minst geselecteerd: <b>${fp.filter(i=>nf(i)==mn).map(i=>esc(S.names[i])).join(", ")}</b> (${mn} van 4 velden)`}
const lvl=p=>{const max=Math.max(...S.sec);if(!max)return"none";const r=S.sec[p]/max;return r<1/3?"low":r<2/3?"mid":"high"};
// Balklengte tegenover de speler met de meeste minuten
function paintBars(){const max=Math.max(1,...S.sec);document.querySelectorAll("[data-bar]").forEach(el=>{const p=+el.dataset.bar;
 el.className="ptb "+lvl(p);el.querySelector("i").style.width=S.sec[p]/max*100+"%"})}
// Verschoven posities per spelvorm en per veld; anders de standaardplaats
const xyOf=f=>((S.xy[S.fmt]=S.xy[S.fmt]||[{},{},{},{}])[f]);
const at=(f,s)=>xyOf(f)[s]||[POS[s][1],POS[s][2]];
// Statusregel onder de klok en kleur van de klokbalk: loopt / gepauzeerd
function perLine(){const st=run?"● Loopt":S.rem<1200&&S.rem>0?"⏸ Gepauzeerd":"";
 $("per").textContent=(st?st+" · ":"")+"Veld "+(S.per+1)+" · "+S.per*20+"–"+(S.per+1)*20+" min · "+score().replace(" – ","–");
 $("bar").classList.toggle("running",!!run);$("bar").classList.toggle("paused",!run&&S.rem<1200&&S.rem>0);
 $("go").disabled=!!run||S.rem<=0&&S.per>=3;$("pa").disabled=!run}
function render(){
 if(S.logo){$("logo").innerHTML='<img src="'+S.logo+'" alt="logo"><input id="lf" type="file" accept="image/*" hidden>';$("lf").onchange=up}
 $("clock").textContent=fmt(S.rem);
 perLine();
 $("score").textContent=score();$("oppn").textContent=oppName();$("mdate").textContent=shortDate(S.date)||"Kies een datum";
 document.querySelectorAll("[data-fmt]").forEach(b=>b.classList.toggle("on",+b.dataset.fmt==S.fmt));
 document.body.classList.toggle("moving",move);document.body.classList.toggle("f11",S.fmt==11);
 $("mv").textContent=move?"✓ Klaar met verschuiven":"✥ Posities verschuiven";$("mv").className=move?"g":"o";
 $("tabs").innerHTML=S.pl.map((f,fi)=>`<button class="tab ${fi==view?"on":""}" data-v="${fi}">Veld ${fi+1}${fi==S.per?" ●":""}<small>${fi*20}–${fi*20+20}'</small></button>`).join("");
 $("fields").innerHTML=S.pl.map((f,fi)=>`<div class="fw ${fi==view?"vis":""}"><div class="fh ${fi==S.per?"act":""}"><span>Veld ${fi+1} <small>${fi*20}–${fi*20+20} min</small></span>${move?`<button class="sw" data-rxy="${fi}">↺ Standaardposities</button>`:fi==S.per?'<span class="now">● Nu bezig</span>':`<button class="sw" data-f="${fi}">⇄ Naar dit veld</button>`}</div><div class="pitch ${fi==S.per?"act":""}">`+
  POS.map((p,si)=>{const pi=f[si],[x,y]=at(fi,si);return `<div class="slot" style="left:${x}%;top:${y}%" data-f="${fi}" data-s="${si}">`+
  (pi==null?'<div class="empty"></div>':`<span class="tok">${kit(pi)}</span><span class="lbl">${esc(S.names[pi])}</span><span class="lbl fm" data-fm="${fi},${pi}">⏱ ${fmt(S.fsec[fi][pi])}</span>`)+
  `<span class="lbl" style="opacity:.85">${pi==null?p[3]||p[0]:""}</span></div>`}).join("")+`</div></div>`).join("");
 $("bench").innerHTML=S.names.map((n,i)=>`<div class="b ${sel===i?"sel":""} ${S.pl[view].includes(i)?"on":""}"><div class="t" data-b="${i}">${kit(i)}<br><small>${isK(i)?"Keeper":"Speler"}</small></div><input value="${esc(n)}" data-n="${i}" maxlength="20"><span class="s4 ${selLvl(i)}" title="Opgesteld op ${nf(i)} van de 4 velden">${dots(i)} ${nf(i)}/4</span><small>⏱ <span data-min="${i}">${fmt(S.sec[i])}</span></small><span class="ptb" data-bar="${i}" title="Gespeelde minuten (volle balk = speler met de meeste minuten)"><i></i></span></div>`).join("");
 $("selsum").innerHTML=selSummary();paintBars();renderGoals();
}
// Doelpunten van beide ploegen samen, met de stand na elk doelpunt
function renderGoals(){
 const all=[...S.goals.map((g,i)=>({...g,i,k:"g"})),...S.og.map((g,i)=>({...g,i,k:"o"})),...S.subs.map((g,i)=>({...g,i,k:"s"}))].sort((a,b)=>a.m-b.m||a.t-b.t);
 let h=0,a=0;const nm=i=>i==null?"–":esc(S.names[i]);
 $("goals").innerHTML=all.length?"<tr><th>Min</th><th>Gebeurtenis</th><th>Stand</th><th class=noprint></th></tr>"+all.map(g=>{
  if(g.k=="s")return `<tr class="sub"><td>${g.m}'</td><td>🔁 ${g.in!=null?`<b>${nm(g.in)}</b> erin`:""}${g.in!=null&&g.out!=null?" voor "+nm(g.out):g.out!=null?nm(g.out)+" eruit":""} <small>(${esc(g.pos)}, veld ${g.f+1})</small></td><td></td><td class="noprint"><button class="x" data-dsub="${g.i}" title="Uit het verloop halen">✕</button></td></tr>`;
  g.k=="g"?h++:a++;
  return `<tr class="${g.k=="g"?"":"opp"}"><td>${g.m}'</td><td>⚽ ${g.k=="g"?nm(g.p):esc(oppName())}</td><td>${h}–${a}</td><td class="noprint"><button class="x" data-${g.k=="g"?"del":"dog"}="${g.i}">✕</button></td></tr>`}).join(""):"<tr><td class='hint'>Nog geen doelpunten of wissels.</td></tr>";
 $("score").textContent=score();perLine();
}
document.addEventListener("click",e=>{
 const t=e.target;
 // Doelpunt via het venster van de speler, met "ongedaan maken" in de melding
 const gp=t.closest("[data-goalp]");if(gp&&pick){const f=pick[0],p=+gp.dataset.goalp;if(run)tick();const g={p,m:f==S.per?minute():f*20+20,t:Date.now()};
  S.goals.push(g);$("pick").close();save();renderGoals();toast("⚽ Doelpunt "+S.names[p]+" ("+g.m+"')",()=>{rm(S.goals,g)});return}
 if(t.closest("[data-undo]")){const u=undoFn;hideToast();if(u){u();save();renderGoals()}return}
 if(t.closest("#toast")){hideToast();return}
 const gs=t.closest("[data-gscorer]");if(gs){scoreGoal(+gs.dataset.gscorer);$("gdlg").close();return}
 if(t.closest("[data-gmore]")){openScorers(true);return}
 if(t.dataset.gclose||t.id=="gdlg"){$("gdlg").close();return}
 if(t.dataset.del){S.goals.splice(+t.dataset.del,1);save();renderGoals();return}
 if(t.dataset.dog){S.og.splice(+t.dataset.dog,1);save();renderGoals();return}
 if(t.dataset.dsub){S.subs.splice(+t.dataset.dsub,1);save();renderGoals();return}
 const fb=t.closest("[data-fmt]");if(fb){setFmt(+fb.dataset.fmt);sel=null;save();render();return}
 const rx=t.closest("[data-rxy]");if(rx){const f=+rx.dataset.rxy;xyOf(f);S.xy[S.fmt][f]={};save();render();return}
 const b=t.closest("[data-b]");if(b){sel=sel===+b.dataset.b?null:+b.dataset.b;render();return}
 const sl=t.closest(".slot");if(sl){if(move)return;const f=+sl.dataset.f,s=+sl.dataset.s;
  if(sel!=null){place(f,s,sel,"sub");sel=null}
  else{openPick(f,s);return}save();render();return}
 const v=t.closest("[data-v]");if(v){view=+v.dataset.v;render();return}
 const act=t.closest("[data-act]");if(act&&pick){const[f,s]=pick,a=act.dataset.act;
  if(a=="move"){openPick(f,s,true);return}$("pick").close();openSwapIn(f,s,a,false);return}
 const so=t.closest("[data-swout]");if(so){openSwapIn(S.per,+so.dataset.swout,"sub",true);return}
 const si=t.closest("[data-swin]");if(si&&swap){doSwap(+si.dataset.swin);return}
 if(t.closest("[data-swback]")&&swap){if(swap.back)openSwapOut();else{$("gdlg").close();openPick(swap.f,swap.s)}return}
 const pk=t.closest("[data-pick]");if(pk&&pick){const[f,s]=pick;place(f,s,+pk.dataset.pick,"sub");
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
// Speler i op positie s van veld f zetten (i<0 = leegmaken).
// Staat i al op dit veld, dan wisselen de twee van plaats. Op een lopend veld is het een wissel
// (in het verloop), of met mode "fix" een verbetering: de minuten van dit veld gaan naar de juiste speler.
function place(f,s,i,mode){const row=S.pl[f],prev=row[s],o=i>=0?row.indexOf(i):-1;if(i===prev)return;
 if(live(f)){if(run)tick();
  if(mode=="fix"){if(prev!=null&&i>=0&&o<0){const t=S.fsec[f][prev];S.fsec[f][prev]=0;S.fsec[f][i]+=t;S.sec[prev]-=t;S.sec[i]+=t;
   // kwam de foute speler via een wissel binnen, dan ook die wissel verbeteren
   const w=S.subs.filter(x=>x.f==f&&x.in===prev).pop();if(w)w.in=i}}
  else if(o<0)S.subs.push({f,m:minute(),out:prev,in:i<0?null:i,pos:POS[s][0],t:Date.now()})}
 if(i<0)row[s]=null;else{if(o>-1)row[o]=prev;row[s]=i}}
// Keuzelijst: eerst de bank, dan wie al op dit veld staat (die wisselen van plaats)
function openPick(f,s,listOnly){
 if(undoFn)hideToast();
 pick=[f,s];const row=S.pl[f],cur=row[s],L=live(f);
 $("pt").textContent="Veld "+(f+1)+" · "+POS[s][0]+(cur!=null?" · "+S.names[cur]:"");
 // Tijdens de wedstrijd eerst een keuzemenu met grote knoppen
 if(L&&cur!=null&&!listOnly){const n=esc(S.names[cur]);
  $("pact").hidden=false;$("pact").innerHTML=`<button class="pi gbtn" data-goalp="${cur}">⚽ Doelpunt voor ${n}</button>
   <button class="pi act" data-act="sub">🔁 Wisselen<small>${n} gaat eruit, jij kiest wie erin komt</small></button>
   <button class="pi act" data-act="fix">✏️ Verkeerde speler ingegeven<small>Kies wie er eigenlijk stond (geen wissel)</small></button>
   <button class="pi act" data-act="move">⇄ Van plaats wisselen<small>met een speler op dit veld</small></button>`;
  $("plist").hidden=true;$("plist").innerHTML="";
 }else{
  const ids=S.names.map((n,i)=>i);
  // Bij het opstellen: wie op de minste velden staat bovenaan; tijdens de wedstrijd: wie het minst speelde
  ids.sort(L?(a,b)=>S.sec[a]-S.sec[b]:(a,b)=>nf(a)-nf(b));
  if(s==0)ids.sort((a,b)=>isK(b)-isK(a));
  const item=i=>{const o=row.indexOf(i);return `<button class="pi ${i===cur?"cur":""}" data-pick="${i}" ${i===cur?"disabled":""}>${kit(i,26)}<span>${esc(S.names[i])}<small class="pm ${L?lvl(i):selLvl(i)}">${L?`⏱ ${Math.round(S.sec[i]/60)}' gespeeld`:`${dots(i)} op ${nf(i)} van 4 velden`}</small></span><small>${i===cur?"staat hier":o>-1?"⇄ "+(POS[o][3]||POS[o][0]):""}</small></button>`};
  const bank=ids.filter(i=>!row.includes(i)),veld=ids.filter(i=>row.includes(i));
  $("pact").hidden=!(cur!=null&&!L);$("pact").innerHTML=cur!=null&&!L?`<button class="pi gbtn" data-goalp="${cur}">⚽ Doelpunt voor ${esc(S.names[cur])}</button>`:"";
  $("plist").hidden=false;
  $("plist").innerHTML=listOnly?`<b class="pg">Wissel van plaats met</b>`+veld.filter(i=>i!==cur).map(item).join(""):
   `<b class="pg">Op de bank</b>`+bank.map(item).join("")+(veld.length?`<b class="pg">Op dit veld <small>(wisselen van plaats)</small></b>`+veld.map(item).join(""):"")+
   (cur!=null?`<button class="pi o" data-pick="-1">✕ Positie leegmaken</button>`:"");
 }
 if(!$("pick").open)$("pick").showModal();$("plist").scrollTop=0;$("pick").scrollTop=0;
}
// Wissel in stappen: wie gaat eruit (spelers op het lopende veld), wie komt erin (bank)
let swap=null;
function openSwapOut(){if(undoFn)hideToast();const f=S.per,row=S.pl[f],L=live(f);
 $("gt").textContent=L?"🔁 Wissel op "+minute()+"' · wie gaat eruit?":"🔁 Veld "+(f+1)+" · wie wil je vervangen?";
 const on=row.map((p,s)=>[p,s]).filter(x=>x[0]!=null);
 $("glist").innerHTML=on.length?`<div class="gg">${on.map(([p,s])=>`<button class="gs" data-swout="${s}">${kit(p,24)}<span>${esc(S.names[p])}<small>${esc(POS[s][3]||POS[s][0])}</small></span></button>`).join("")}</div>`:`<p class="hint">Nog niemand opgesteld op veld ${f+1}.</p>`;
 if(!$("gdlg").open)$("gdlg").showModal()}
function openSwapIn(f,s,mode,back){swap={f,s,mode,back};const row=S.pl[f],out=row[s],n=esc(S.names[out]);
 const ids=S.names.map((x,i)=>i).filter(i=>!row.includes(i)).sort((a,b)=>S.sec[a]-S.sec[b]);if(s==0)ids.sort((a,b)=>isK(b)-isK(a));
 $("gt").textContent=mode=="fix"?"✏️ Wie stond er eigenlijk i.p.v. "+S.names[out]+"?":"🔁 Wie komt erin voor "+S.names[out]+"?";
 $("glist").innerHTML=(mode=="fix"?`<p class="hint">De minuten van ${n} op dit veld gaan naar de speler die je kiest. Er komt geen wissel in het verloop.</p>`:"")+
  (ids.length?`<div class="gg">${ids.map(i=>`<button class="gs" data-swin="${i}">${kit(i,24)}<span>${esc(S.names[i])}<small class="pm ${lvl(i)}">⏱ ${Math.round(S.sec[i]/60)}' gespeeld</small></span></button>`).join("")}</div>`:`<p class="hint">Niemand meer op de bank.</p>`)+
  `<div class="gx"><button class="o" data-swback="1">‹ Terug</button></div>`;
 if(!$("gdlg").open)$("gdlg").showModal();$("glist").scrollTop=0}
function doSwap(i){const{f,s,mode}=swap,row=S.pl[f],out=row[s],L=live(f);if(L&&run)tick();
 // Gegevens om de wissel binnen enkele seconden ongedaan te maken
 const before=row.slice(),nSubs=S.subs.length,w=S.subs.filter(x=>x.f==f&&x.in===out).pop(),wIn=w&&w.in,i0=S.fsec[f][i];
 place(f,s,i,mode);$("gdlg").close();save();render();
 toast(mode=="fix"?"✏️ "+S.names[out]+" vervangen door "+S.names[i]:"🔁 "+S.names[i]+" erin voor "+S.names[out]+(L?" ("+minute()+"')":""),()=>{
  if(run)tick();const d=S.fsec[f][i]-i0;if(L&&d>0){S.fsec[f][i]-=d;S.sec[i]-=d;S.fsec[f][out]+=d;S.sec[out]+=d}
  S.pl[f]=before;S.subs.length=nSubs;if(w)w.in=wIn;render()})}
document.addEventListener("change",e=>{if(e.target.dataset.n!=null){S.names[+e.target.dataset.n]=e.target.value||"Speler";save();render()}});
function up(e){const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const c=document.createElement("canvas");const k=Math.min(1,256/Math.max(im.width,im.height));c.width=im.width*k;c.height=im.height*k;c.getContext("2d").drawImage(im,0,0,c.width,c.height);S.logo=c.toDataURL("image/png");save();render()};im.src=r.result};r.readAsDataURL(f)}
$("lf").onchange=up;
// Tijd wordt berekend uit de klok van het toestel, zodat ze blijft kloppen bij schermvergrendeling, app wisselen of herladen
function tick(){
 const n=Math.floor((Date.now()-S.last)/1000);
 for(let k=0;k<n&&run;k++){
  S.last+=1000;S.rem--;
  S.pl[S.per].forEach(p=>{if(p!=null){S.sec[p]++;S.fsec[S.per][p]++}});
  // Signaal alleen als het moment net gepasseerd is (niet achteraf na een vergrendeld scherm)
  if(n-k<=3){if(S.rem==120)signal("warn");if(S.rem==0)signal("end")}
  if(S.rem<=0){stop();if(S.per<3){S.per++;S.rem=1200;view=S.per}else S.rem=0;render()}
 }
 if(n<1)return;
 $("clock").textContent=fmt(S.rem);
 document.querySelectorAll("[data-min]").forEach(el=>el.textContent=fmt(S.sec[+el.dataset.min]));
 document.querySelectorAll("[data-fm]").forEach(el=>{const[f,p]=el.dataset.fm.split(",");el.textContent="⏱ "+fmt(S.fsec[f][p])});
 paintBars();save();
}
async function lock(){try{if(run&&!wl&&navigator.wakeLock){wl=await navigator.wakeLock.request("screen");wl.onrelease=()=>{wl=null}}}catch(e){}}
function loop(){run=setInterval(tick,250);lock()}
function stop(){clearInterval(run);run=null;S.run=false;if(wl)wl.release();save()}
// Signaal: piep (Web Audio), trilling (waar de GSM dat kan), knipperende klok en een melding
let actx;
function audio(){try{actx=actx||new(window.AudioContext||window.webkitAudioContext)();if(actx.state=="suspended")actx.resume()}catch(e){}}
function beep(n,hz){if(!actx)return;for(let k=0;k<n;k++){const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime+k*.45;
 o.frequency.value=hz;o.connect(g);g.connect(actx.destination);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.5,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+.35);o.start(t);o.stop(t+.4)}}
let toastT;
let undoFn=null;
// Alleen verwijderen als het doelpunt er nog staat (kan al met ✕ weg zijn)
const rm=(a,g)=>{const i=a.indexOf(g);if(i>-1)a.splice(i,1)};
const hideToast=()=>{clearTimeout(toastT);$("toast").hidden=true;undoFn=null};
function toast(m,undo,ms){const el=$("toast");undoFn=undo||null;el.innerHTML="<span>"+esc(m)+"</span>"+(undo?'<button class="undo" data-undo="1">Ongedaan maken</button>':"");el.hidden=false;clearTimeout(toastT);toastT=setTimeout(hideToast,ms||(undo?4000:6000))}
function signal(kind){
 const end=kind=="end",f=S.per+1;
 toast(end?"⏱ Einde van veld "+f+(f<4?" – volgende: veld "+(f+1):" – wedstrijd voorbij"):"⏱ Nog 2 minuten op veld "+f+" – zet je wissels klaar");
 $("bar").classList.remove("sig-warn","sig-end");void $("bar").offsetWidth;$("bar").classList.add(end?"sig-end":"sig-warn");
 try{navigator.vibrate&&navigator.vibrate(end?[400,150,400,150,400]:[250])}catch(e){}
 beep(end?3:1,end?880:660)}
// Voelbare en hoorbare bevestiging bij start en pauze (trillen kan niet op iPhone, het tikje wel)
function press(start){try{navigator.vibrate&&navigator.vibrate(start?60:[40,60,40])}catch(e){}
 if(actx){const o=actx.createOscillator(),g=actx.createGain(),t=actx.currentTime;o.frequency.value=start?1320:660;o.connect(g);g.connect(actx.destination);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.25,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.09);o.start(t);o.stop(t+.1)}
 $("bar").classList.remove("flash");void $("bar").offsetWidth;$("bar").classList.add("flash")}
$("go").onclick=()=>{audio();if(!run&&view!=S.per&&!goTo(view))return;if(!run&&S.rem>0){S.last=Date.now();S.run=true;save();loop();render();
 press(true);toast("▶ Klok gestart · veld "+(S.per+1),null,1600)}};
document.addEventListener("visibilitychange",()=>{if(document.visibilityState=="visible"&&run){tick();lock()}});
$("pa").onclick=()=>{if(!run)return;stop();render();press(false);toast("⏸ Gepauzeerd op "+fmt(S.rem),null,1600)};
function resetMatch(){stop();S.per=view=0;S.rem=1200;S.sec=Array(N).fill(0);S.fsec=[0,1,2,3].map(()=>Array(N).fill(0));S.goals=[];S.og=[];S.subs=[]}
$("rs").onclick=()=>{if(confirm("Tijd, spelersminuten en doelpunten (ook van de tegenstander) resetten? (opstelling en namen blijven)")){resetMatch();save();render()}};
$("pr").onclick=()=>window.print();
// Doelpunt van de tegenstander, op de minuut van de lopende klok
// Doelpunt Heibos: kies de scorer uit wie nu op het lopende veld staat (grote knoppen, zonder scrollen)
function scoreGoal(p){if(run)tick();const g={p,m:minute(),t:Date.now()};S.goals.push(g);save();renderGoals();
 toast("⚽ Doelpunt "+S.names[p]+" ("+g.m+"')",()=>{rm(S.goals,g)})}
function openScorers(all){if(undoFn)hideToast();
 const on=S.pl[S.per].filter(i=>i!=null),ids=all?S.names.map((n,i)=>i).filter(i=>!on.includes(i)):on;
 $("gt").textContent=all?"⚽ Andere speler":"⚽ Wie scoorde? · veld "+(S.per+1)+" · "+minute()+"'";
 $("glist").innerHTML=(ids.length?`<div class="gg">${ids.map(i=>`<button class="gs" data-gscorer="${i}">${kit(i,24)}<span>${esc(S.names[i])}</span></button>`).join("")}</div>`:`<p class="hint">Nog niemand opgesteld op veld ${S.per+1}.</p>`)+
  (all?"":`<div class="gx"><button class="o" data-gmore="1">Andere speler…</button></div>`);
 if(!$("gdlg").open)$("gdlg").showModal()}
$("ug").onclick=()=>openScorers(false);
$("wis").onclick=openSwapOut;
$("og").onclick=()=>{if(run)tick();const g={f:S.per,m:minute(),t:Date.now()};S.og.push(g);save();renderGoals();toast("⚽ Tegengoal "+oppName()+" ("+g.m+"')",()=>{rm(S.og,g)})};
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
// Alleen de wedstrijden van de maand die de kalender toont, zodat de lijst kort blijft
function drawSaved(){const ym=calM.getFullYear()+"-"+String(calM.getMonth()+1).padStart(2,"0"),all=Object.keys(S.matches),ds=all.filter(d=>d.startsWith(ym)).sort();
 const mn=calM.toLocaleDateString("nl-BE",{month:"long"}),rest=all.length-ds.length;
 $("saved").innerHTML=!all.length?"":`<b>Wedstrijden in ${mn}</b>`+(ds.length?"":`<small class="hint">Geen wedstrijden in ${mn}. Blader met ‹ › naar een andere maand.</small>`)+ds.map(d=>{const m=S.matches[d],played=m.goals.length+m.og.length>0||m.sec.some(x=>x>0);
  return `<div class="sv ${d==calSel?"on":""}"><button type="button" class="svb" data-cd="${d}"><span class="${played?"":"gp"}">${played?m.goals.length+"–"+m.og.length:"gepland"}</span> ${shortDate(d).replace(/ \d{4}$/,"")} · ${esc(m.opp||"Tegenstander")}</button>${d==S.date?'<small>open</small>':`<button type="button" class="x" data-rm="${d}" title="Wedstrijd verwijderen">✕</button>`}</div>`}).join("")+(rest?`<small class="hint">${rest} ${rest==1?"andere wedstrijd":"andere wedstrijden"} in andere maanden · alles in 📊 Seizoen</small>`:"")}
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
 const url=location.href.split("#")[0]+"#o="+b64(JSON.stringify({n:S.names,p:S.pl,f:S.fmt,xy:S.xy[S.fmt]||null,fl:1,o:S.opp,d:S.date}));
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
 if(xy){if(!d.fl)xy.forEach(o=>{for(const s in o)o[s][1]=100-o[s][1]});S.xy[n]=xy}
 if(typeof d.o=="string")S.opp=d.o.slice(0,30);if(/^\d{4}-\d\d-\d\d$/.test(d.d||""))S.date=d.d;
 save();return true;
}
// Werken zonder internet: de service worker bewaart een kopie van de app (alleen op de echte website)
if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js").catch(()=>{});
const shared=loadShared();
addEventListener("hashchange",()=>{loadShared();render()});
render();
if(S.run&&S.rem>0){loop();tick()}else{S.run=false;if(!shared)openMatch(true)}
