(function(){
"use strict";
const C=window.CONFIG,$=s=>document.querySelector(s),app=$("#main");
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const slug=s=>String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const call=v=>v||"Please call ahead";
const PHONE_HREF="tel:"+C.PHONE.replace(/[^\d+]/g,"");
const BASE=String(C.SITE_BASE_URL||"").replace(/\/+$/,"");
const ic=(n,c)=>`<svg class="ic${c?" "+c:""}" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;
const NAV=[["#/","Home"],["#/animals","Our Animals"],["#/adopt","Adopt or Foster"],["#/report","Report an Animal"],["#/services","Services"],["#/get-involved","Get Involved"],["#/about","About"]];
if(C.SHOW_HAPPY_TAILS)NAV.splice(2,0,["#/happy-tails","Happy Tails"]);

/* CSV parser: handles quotes, commas and newlines inside quotes */
function parseCSV(t){const rows=[];let r=[],f="",q=false;t=t.replace(/^\uFEFF/,"");
for(let i=0;i<t.length;i++){const c=t[i];
if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}
else if(c=='"')q=true;else if(c==","){r.push(f);f=""}
else if(c=="\n"||c=="\r"){if(c=="\r"&&t[i+1]=="\n")i++;r.push(f);f="";if(r.some(x=>x!==""))rows.push(r);r=[]}else f+=c}
r.push(f);if(r.some(x=>x!==""))rows.push(r);
const h=(rows.shift()||[]).map(x=>x.trim().toLowerCase());
return rows.map(a=>{const o={};h.forEach((k,i)=>o[k]=(a[i]||"").trim());return o})}

/* Data: cached per session, falls back to sample data */
let cache=null,usingSample=false;
async function load(){if(cache)return cache;let rows=null;
if(C.ANIMALS_CSV_URL){try{const r=await fetch(C.ANIMALS_CSV_URL);if(!r.ok)throw 0;rows=parseCSV(await r.text());if(!rows.length||!("animal_id" in rows[0]))throw 0}catch(e){rows=null}}
if(!rows){rows=window.SAMPLE_ANIMALS||[];usingSample=true}
cache=rows.filter(a=>/^SH-\d{4}$/.test(a.animal_id||"")&&String(a.published).trim().toLowerCase()==="yes");return cache}

/* Shared pieces */
const PH=`<div class="ph ph-empty" role="img" aria-label="No photo available">${ic("paw")}</div>`;
function photo(a){return a.photo_url?`<img class="ph" src="${esc(a.photo_url)}" alt="${esc(a.name)}, ${esc(a.species)}" loading="lazy" width="400" height="300" data-fb>`:PH}
document.addEventListener("error",e=>{const t=e.target;if(t&&t.dataset&&t.dataset.fb!==undefined){const d=document.createElement("div");d.innerHTML=PH;t.replaceWith(d.firstChild)}},true);
const badge=s=>`<span class="badge s-${slug(s)}">${esc(s)}</span>`;
const card=a=>`<a class="card" href="#/animal/${esc(a.animal_id)}"><div class="thumb">${photo(a)}${badge(a.status)}</div><div class="body"><h3>${esc(a.name)}</h3><p class="meta">${esc(a.species)} · ${esc(a.sex)} · ${esc(a.approx_age)}</p><small class="id">${esc(a.animal_id)}</small></div></a>`;
const skel='<div class="grid"><div class="sk"></div><div class="sk"></div><div class="sk"></div></div>';
const errBox=m=>`<div class="err warn" role="alert"><p>${m} <a href="#/animals">Back to animals</a></p></div>`;
const formLink=(url,id)=>{if(!url)return null;if(id&&C.ADOPT_FORM_ANIMAL_ENTRY)url+=(url.includes("?")?"&":"?")+"usp=pp_url&"+C.ADOPT_FORM_ANIMAL_ENTRY+"="+encodeURIComponent(id);return url};
const noForm=`<div class="empty">${ic("info")}<p>The form is not set up yet. Please call ${esc(C.PHONE)} instead.</p></div>`;
const head=(title,lead)=>`<header class="page-head"><div class="wrap"><h1>${title}</h1>${lead?`<p class="lead">${lead}</p>`:""}</div></header>`;
const sec=h=>`<div class="wrap sec">${h}</div>`;
const SERVICES=[["alert","Emergency treatment"],["stethoscope","OPD consultations"],["scissors","Minor surgeries"],["syringe","Vaccinations"],["shield","Deworming and flea/tick treatment"],["bed","IPD care"],["flask","Diagnostics (X-ray, blood panels)"],["home","Doorstep treatment and vaccination visits"]];

/* Hero artwork (used until a real photo is set as CONFIG.HERO_IMAGE) */
const ART=`<svg class="art" viewBox="0 0 400 480" aria-hidden="true" focusable="false"><defs><clipPath id="archc"><path d="M0 480V200C0 89.5 89.5 0 200 0s200 89.5 200 200v280z"/></clipPath></defs>
<g clip-path="url(#archc)"><rect width="400" height="480" fill="var(--a1)"/>
<circle cx="278" cy="150" r="64" fill="var(--sun)" opacity=".95"/><circle cx="278" cy="150" r="92" fill="var(--sun)" opacity=".16"/>
<path d="M-20 330C70 270 150 285 230 325s130 18 190-22V480H-20z" fill="var(--a2)"/>
<path d="M-20 400C80 360 170 380 260 412s120 2 160-18V480H-20z" fill="var(--a3)"/>
<g fill="var(--paw)"><use href="#i-paw" x="52" y="352" width="44" height="44" transform="rotate(-16 74 374)" opacity=".92"/>
<use href="#i-paw" x="120" y="316" width="44" height="44" transform="rotate(12 142 338)" opacity=".92"/>
<use href="#i-paw" x="190" y="352" width="52" height="52" transform="rotate(-8 216 378)"/>
<use href="#i-paw" x="262" y="318" width="40" height="40" transform="rotate(16 282 338)" opacity=".85"/>
<use href="#i-paw" x="318" y="384" width="34" height="34" transform="rotate(-12 335 401)" opacity=".7"/></g></g>
<path d="M1 480V200C1 90 90 1 200 1s199 89 199 199v280" fill="none" stroke="rgba(243,240,228,.28)" stroke-width="2"/></svg>`;

/* ---------- Views ---------- */
async function home(){
const art=C.HERO_IMAGE?`<div class="arch"><img src="${esc(C.HERO_IMAGE)}" alt=""></div>`:ART;
app.innerHTML=`<section class="hero"><div class="wrap hero-grid"><div class="hero-copy">
<p class="chip">${ic("paw")} A unit of ${esc(C.PARENT)}</p>
<h1>${esc(C.CENTRE_NAME)}</h1><p class="tagline">${esc(C.TAGLINE)}</p><p class="hero-sub">${esc(C.ADDRESS)}</p>
<div class="row"><a class="btn emg" href="${PHONE_HREF}">${ic("phone")} Emergency helpline</a><a class="btn ghost-dark" href="https://wa.me/${esc(C.WHATSAPP)}" rel="noopener">${ic("chat")} WhatsApp</a><a class="btn primary" href="#/animals">Meet our animals ${ic("arrow")}</a></div>
${C.EMERGENCY_24X7_CLAIM?'<p class="fine">Emergency response available 24x7.</p>':'<p class="fine">Please call to check availability.</p>'}
</div><div class="hero-art" aria-hidden="true">${art}</div></div></section>
<div class="wrap"><div class="paths">
<a class="path urgent" href="#/report"><span class="pi">${ic("alert")}</span><h3>Found an animal in need?</h3><p>Call first, then send us the details.</p><span class="go">Report an animal ${ic("arrow")}</span></a>
<a class="path" href="#/animals"><span class="pi">${ic("heart")}</span><h3>Looking to adopt or foster?</h3><p>See the animals waiting for a home.</p><span class="go">Meet our animals ${ic("arrow")}</span></a>
<a class="path" href="#/get-involved"><span class="pi">${ic("users")}</span><h3>Want to help?</h3><p>Volunteer, foster, donate or spread the word.</p><span class="go">Get involved ${ic("arrow")}</span></a>
</div></div>
<div class="wrap stats-wrap"><div class="sec-h"><h2>Animals right now</h2></div><div id="st">${skel}</div></div>
<div class="wrap sec"><div class="sec-h"><h2>Looking for a home</h2><a href="#/animals">See all animals ${ic("arrow")}</a></div><div id="ft"></div></div>
<div class="wrap"><div class="sec-h"><h2>What we do</h2><a href="#/services">All services ${ic("arrow")}</a></div>
<div class="chips">${SERVICES.map(([i,t])=>`<a class="chipl" href="#/services">${ic(i)} ${t}</a>`).join("")}</div></div>
<div class="wrap sec"><div class="cta"><h2>${esc(C.TAGLINE)}</h2><div class="row"><a class="btn primary" href="#/get-involved">Get involved ${ic("arrow")}</a><a class="btn ghost-dark" href="#/report">Report an animal</a></div></div></div>`;
try{const L=await load(),by=s=>L.filter(a=>a.status===s).length;
$("#st").innerHTML='<div class="stats">'+["Adoptable","In care","Fostered","Adopted","Released after sterilisation"].map((s,i)=>`<div class="stat${i===0?" hi":""}"><b>${by(s)}</b><span>${s}</span></div>`).join("")+"</div>";
const f=L.filter(a=>a.status==="Adoptable").slice(0,3);$("#ft").innerHTML=f.length?'<div class="grid">'+f.map(card).join("")+"</div>":`<div class="empty">${ic("paw")}<p>No animals are listed as adoptable right now.</p></div>`}
catch(e){$("#st").innerHTML=errBox("Could not load animals.")}}

const FIL=[["species","Species",["Dog","Cat","Other"]],["sex","Sex",["Male","Female","Unknown"]],["status","Status",["In care","Adoptable","Fostered","Adopted","Released after sterilisation"]],["size","Size",["Small","Medium","Large"]],["vaccinated","Vaccinated",["Yes","No","Partial"]],["sterilised","Sterilised",["Yes","No","Unknown"]]];
const sel=([k,l,o])=>`<div><label for="f_${k}">${l}</label><select id="f_${k}"><option value="">Any</option>${o.map(x=>`<option>${x}</option>`).join("")}</select></div>`;
const F=k=>FIL.find(x=>x[0]===k);
async function animals(){
app.innerHTML=head("Our Animals")+sec(`<form class="filters" id="fl" onsubmit="return false">
<div class="search">${ic("search")}<label class="sr" for="q">Search by name or ID</label><input id="q" type="search" placeholder="Search by name or ID" autocomplete="off"></div>
<div class="fgrid">${sel(F("species"))}${sel(F("status"))}<div><label for="sort">Sort</label><select id="sort"><option value="new">Newest first</option><option value="name">Name A-Z</option></select></div></div>
<details class="more"><summary>More filters</summary><div class="fgrid four">${["sex","size","vaccinated","sterilised"].map(k=>sel(F(k))).join("")}</div></details>
<label class="check"><input type="checkbox" id="all">Show all published animals (not only adoptable)</label></form>
<p id="cnt" aria-live="polite"></p><div id="res">${skel}</div>`);
let L;try{L=await load()}catch(e){$("#res").innerHTML=errBox("Could not load animals.");return}
const run=()=>{const q=$("#q").value.toLowerCase().trim(),all=$("#all").checked;
let r=L.filter(a=>(all||a.status==="Adoptable"||$("#f_status").value)&&(!q||(a.name+" "+a.animal_id).toLowerCase().includes(q))&&FIL.every(([k])=>!$("#f_"+k).value||a[k]===$("#f_"+k).value));
r.sort($("#sort").value==="name"?(x,y)=>x.name.localeCompare(y.name):(x,y)=>(y.last_updated||"").localeCompare(x.last_updated||""));
$("#cnt").textContent=r.length+(r.length===1?" animal found":" animals found");
$("#res").innerHTML=r.length?'<div class="grid">'+r.map(card).join("")+"</div>":`<div class="empty">${ic("paw")}<p>No animals match. Try clearing a filter, or tick "Show all published animals".</p></div>`};
$("#fl").addEventListener("input",run);run()}

const chip=(label,v)=>{if(!v)return"";const k=/^yes$/i.test(v)?"ok":/^(partial|unknown)$/i.test(v)?"mid":"no";return`<span class="hchip ${k}">${ic(k==="ok"?"check":"minus")}${label}: ${esc(v)}</span>`};
async function profile(id){app.innerHTML=sec(skel);let L;try{L=await load()}catch(e){app.innerHTML=sec(errBox("Could not load this profile."));return}
const a=L.find(x=>x.animal_id===id);
if(!a){app.innerHTML=head("Animal not found")+sec(`<div class="empty warn">${ic("alert")}<p>We could not find a public profile for <b>${esc(id)}</b>. It may have been removed or not yet published.</p></div><p style="margin-top:22px"><a class="btn primary" href="#/animals">See all animals</a></p>`);return}
const url=BASE+"/#/animal/"+a.animal_id,enq=formLink(C.ADOPT_FORM_URL,a.animal_id);
const rows=[["Species",a.species],["Sex",a.sex],["Approx. age",a.approx_age],["Size",a.size],["Colour",a.colour],["Description",a.breed_or_description],["Temperament",a.temperament],["Good with",a.good_with],["Special needs",a.special_needs],["Last vaccination",a.last_vaccination_date],["Area found",a.area_found]].filter(r=>r[1]);
app.innerHTML=sec(`<a class="back" href="#/animals">${ic("back")} All animals</a><article class="profile"><div class="media"><div class="thumb">${photo(a)}</div></div><div>
<h1>${esc(a.name)}</h1><div class="pmeta">${badge(a.status)}<span class="id">ID ${esc(a.animal_id)}</span></div>
<div class="health">${chip("Vaccinated",a.vaccinated)}${chip("Sterilised",a.sterilised)}${chip("Ear-notched",a.ear_notched)}</div>
<dl class="facts">${rows.map(r=>`<div><dt>${r[0]}</dt><dd>${esc(r[1])}</dd></div>`).join("")}</dl>
${a.story?`<div class="story"><h2>Story</h2><p>${esc(a.story)}</p></div>`:""}
<p class="updated">Last updated: ${esc(a.last_updated)}</p>
<div class="row"><a class="btn primary" href="${esc(enq||"#/adopt")}"${enq?' target="_blank" rel="noopener"':""}>Enquire to adopt or foster</a><button class="btn alt" id="sh" type="button">${ic("share")} Share</button></div>
<a class="linkish" href="mailto:${esc(C.EMAIL)}?subject=${encodeURIComponent("Problem with profile "+a.animal_id)}">Report a problem with this profile</a><p id="shm" aria-live="polite"></p></div></article>`);
$("#sh").onclick=async()=>{try{if(navigator.share)await navigator.share({title:a.name,url});else{await navigator.clipboard.writeText(url);$("#shm").textContent="Link copied."}}catch(e){$("#shm").textContent=url}}}

function adopt(){const f=formLink(C.ADOPT_FORM_URL);
const steps=["Send an enquiry (below).","The centre calls you.","You meet the animal.",C.HOME_CHECK_REQUIRED===false?"No home check.":"A home check, if the centre requires one.","Paperwork."];
app.innerHTML=head("Adopt or Foster")+sec(`<ol class="steps">${steps.map(s=>`<li>${s}</li>`).join("")}</ol>
<div class="note-card"><p>${esc(C.ADOPTION_POLICY)||"Fees and policies: please call ahead."}</p></div>
${f?`<a class="btn primary" href="${esc(f)}" target="_blank" rel="noopener">Open enquiry form ${ic("arrow")}</a>`:noForm}`)}

function report(){const f=C.REPORT_FORM_URL;
const tips=[["shield","Stay calm and keep your distance if the animal is frightened."],["alert","Do not force-feed or give medicine."],["pin","Keep the animal away from traffic if you can do so safely."],["chat","Send your location on WhatsApp."]];
app.innerHTML=head("Report an Animal")+sec(`<div class="callout" role="note"><div><h2>Emergency? Call first</h2><p>Phone the helpline before filling in any form.</p></div><a class="btn emg" href="${PHONE_HREF}">${ic("phone")} ${esc(C.PHONE)}</a></div>
<h2 class="sub-h" style="margin-top:0">General safety guidance</h2>
<ul class="tiles">${tips.map(([i,t])=>`<li class="tile"><span class="ti">${ic(i)}</span><span class="t">${t}</span></li>`).join("")}</ul>
<p class="fine" style="color:var(--ink-2)">This is general guidance, not veterinary advice.</p>
<div class="row">${f?`<a class="btn primary" href="${esc(f)}" target="_blank" rel="noopener">Fill rescue report form ${ic("arrow")}</a>`:noForm}</div>`)}

function services(){app.innerHTML=head("Services")+sec(`<div class="cards">${SERVICES.map(([i,t])=>`<div class="info"><span class="ti">${ic(i)}</span><h3>${t}</h3></div>`).join("")}</div>
<div class="cards" style="margin-top:22px"><div class="info"><span class="ti">${ic("clock")}</span><h3>Hours</h3><p>${esc(call(C.HOURS))}</p></div><div class="info"><span class="ti">${ic("info")}</span><h3>Free or paid</h3><p>${esc(call(C.FEES_INFO))}</p></div></div>`)}

function involved(){const d=C.DONATE,has=d.UPI||d.BANK||d.LINK;
app.innerHTML=head("Get Involved")+sec(`<div class="cards">
<div class="info"><span class="ti">${ic("users")}</span><h3>Volunteer or foster</h3><p>Call or email us to ask how you can help.</p><p style="margin-top:12px"><a href="#/adopt"><b>Adopt or foster</b></a></p></div>
<div class="info"><span class="ti">${ic("alert")}</span><h3>See an animal in need?</h3><p>Share the location and details with the team.</p><p style="margin-top:12px"><a href="#/report"><b>Report an animal</b></a></p></div>
${has?`<div class="info"><span class="ti">${ic("gift")}</span><h3>Donate</h3><p>${d.UPI?"UPI: "+esc(d.UPI)+"<br>":""}${d.BANK?esc(d.BANK)+"<br>":""}${d.LINK?`<a href="${esc(d.LINK)}">Donation link</a>`:""}</p></div>`:""}</div>`)}

function about(){app.innerHTML=head("About and Contact")+sec(`<div class="two"><div class="prose"><h2>Who we are</h2><p style="margin-top:.7em">${esc(C.CENTRE_NAME)} is a unit of ${esc(C.PARENT)}, a Noida animal-welfare charity.</p><p class="lead" style="font-style:italic;font-family:var(--f-h)">${esc(C.TAGLINE)}</p>
<p class="fine" style="color:var(--ink-2)">Contact details are being confirmed with the centre. Please call to confirm before visiting.</p></div>
<ul class="contact">
<li><span class="ci">${ic("pin")}</span><div><small>Address</small>${esc(C.ADDRESS)}${C.LANDMARK?"<br>"+esc(C.LANDMARK):""}<br><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.CENTRE_NAME+" "+C.ADDRESS)}" rel="noopener">Open in Google Maps</a></div></li>
<li><span class="ci">${ic("phone")}</span><div><small>Phone</small><a href="${PHONE_HREF}">${esc(C.PHONE)}</a></div></li>
<li><span class="ci">${ic("mail")}</span><div><small>Email</small><a href="mailto:${esc(C.EMAIL)}">${esc(C.EMAIL)}</a></div></li>
<li><span class="ci">${ic("chat")}</span><div><small>Social</small><a href="${esc(C.FACEBOOK)}" rel="noopener">Facebook</a> · <a href="${esc(C.INSTAGRAM)}" rel="noopener">Instagram</a></div></li></ul></div>`)}

async function tails(){app.innerHTML=head("Happy Tails")+sec(skel);const L=(await load()).filter(a=>a.status==="Adopted");
app.innerHTML=head("Happy Tails")+sec(L.length?'<div class="grid">'+L.map(card).join("")+"</div>":`<div class="empty">${ic("paw")}<p>No adopted animals to show yet.</p></div>`)}

function staff(){app.innerHTML=head("Staff guide")+sec(`<ol class="steps"><li>Open the Google Sheet, tab "Animals".</li><li>Add a new row. Use the next ID (SH-0011, and so on). Never reuse an ID.</li><li>Pick values from the dropdowns. Dates look like 2025-01-31.</li><li>Paste a photo link in photo_url (optional).</li><li>Set published to Yes only when the centre approves.</li><li>Update last_updated. Changes appear on the site within a few minutes.</li></ol><div class="note-card"><p>To retire a record, set published to No. Do not delete the row.</p></div>`)}

/* ---------- Page chrome ---------- */
let lastDate="";
function paintChrome(){
$("#banner").innerHTML=C.SHOW_SAMPLE_BANNER?`<div class="sample-note" role="note">${ic("info")} Sample data for demonstration. These are not real animals.</div>`:"";
$("#footer").innerHTML=`<div class="wrap ftr-grid"><div><p class="ftr-brand">${esc(C.CENTRE_NAME)}</p><p>${esc(C.ADDRESS)}</p><p><a href="${PHONE_HREF}">${esc(C.PHONE)}</a></p></div>
<div><p class="ftr-h">Explore</p><ul>${NAV.slice(1).map(([u,l])=>`<li><a href="${u}">${l}</a></li>`).join("")}</ul></div>
<div><p class="ftr-h">Please note</p><p>Information compiled by student volunteers; please call to confirm before visiting.</p>${lastDate?`<p>Last updated: ${esc(lastDate)}</p>`:""}</div></div>`}
function route(){const h=location.hash.replace(/^#\/?/,""),[p,arg]=h.split("/");
setMenu(false);
const here=p==="animal"?"animals":p;
$("#nav").innerHTML=NAV.map(([u,l])=>`<a href="${u}"${(u==="#/"+here||(u==="#/"&&!here))?' aria-current="page"':""}>${l}</a>`).join("");
const routes={"":home,animals,adopt,report,services,"get-involved":involved,about,"happy-tails":tails,staff};
const fn=p==="animal"?()=>profile(decodeURIComponent(arg||"")):routes[p];
app.classList.remove("in");void app.offsetWidth;app.classList.add("in");
if(fn)fn();else app.innerHTML=head("Page not found")+sec('<a class="btn primary" href="#/">Go home</a>');
window.scrollTo(0,0);app.focus({preventScroll:true});document.title=C.CENTRE_NAME;
paintChrome();
load().then(L=>{const d=L.map(a=>a.last_updated).filter(Boolean).sort().pop()||"";if(d!==lastDate){lastDate=d;paintChrome()}}).catch(()=>{})}

/* Menu and theme */
function setMenu(o){$("#nav").classList.toggle("open",o);$("#menu").setAttribute("aria-expanded",o);$("#menu").innerHTML=ic(o?"x":"menu")}
const root=document.documentElement;
const isDark=()=>root.dataset.theme==="dark"||(!root.dataset.theme&&matchMedia("(prefers-color-scheme:dark)").matches);
function paintTheme(){const d=isDark();$("#theme").innerHTML=ic(d?"sun":"moon");$("#theme").setAttribute("aria-label",d?"Switch to light mode":"Switch to dark mode")}
$("#emgBtn").href=PHONE_HREF;
$("#menu").onclick=()=>setMenu(!$("#nav").classList.contains("open"));
$("#theme").onclick=()=>{root.dataset.theme=isDark()?"light":"dark";try{localStorage.setItem("theme",root.dataset.theme)}catch(e){}paintTheme()};
paintTheme();setMenu(false);
addEventListener("hashchange",route);route();
})();
