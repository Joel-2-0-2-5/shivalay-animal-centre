(function(){
"use strict";
const C=window.CONFIG,$=s=>document.querySelector(s),app=$("#main");
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const call=v=>v||"Please call ahead";
const PHONE_HREF="tel:"+C.PHONE.replace(/[^\d+]/g,"");
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
if(C.ANIMALS_CSV_URL){try{const r=await fetch(C.ANIMALS_CSV_URL);if(!r.ok)throw 0;rows=parseCSV(await r.text());if(!rows.length)throw 0}catch(e){rows=null}}
if(!rows){rows=window.SAMPLE_ANIMALS||[];usingSample=true}
cache=rows.filter(a=>/^SH-\d{4}$/.test(a.animal_id||"")&&String(a.published).trim().toLowerCase()==="yes");return cache}

const ICON='<svg viewBox="0 0 64 48" role="img" aria-label="No photo available" width="100%" height="100%"><rect width="64" height="48" fill="none"/><g fill="none" stroke="currentColor" stroke-width="2" opacity=".5"><circle cx="20" cy="18" r="4"/><circle cx="32" cy="14" r="4"/><circle cx="44" cy="18" r="4"/><ellipse cx="32" cy="32" rx="10" ry="8"/></g></svg>';
function photo(a,cls){return a.photo_url?`<img class="${cls}" src="${esc(a.photo_url)}" alt="${esc(a.name)}, ${esc(a.species)}" loading="lazy" width="400" height="300" data-fb>`:`<div class="${cls}" style="color:var(--ink)">${ICON}</div>`}
document.addEventListener("error",e=>{if(e.target.dataset&&e.target.dataset.fb!==undefined){const d=document.createElement("div");d.className=e.target.className;d.innerHTML=ICON;e.target.replaceWith(d)}},true);
const card=a=>`<a class="card" href="#/animal/${esc(a.animal_id)}">${photo(a,"ph")}<div class="body"><span class="badge ${esc(a.status)}">${esc(a.status)}</span><h3>${esc(a.name)}</h3><div>${esc(a.species)} · ${esc(a.sex)} · ${esc(a.approx_age)}</div><small>${esc(a.animal_id)}</small></div></a>`;
const skel='<div class="grid"><div class="sk"></div><div class="sk"></div><div class="sk"></div></div>';
const errBox=m=>`<div class="err warn" role="alert">${m} <a href="#/animals">Back to animals</a></div>`;
const formLink=(url,id)=>{if(!url)return null;if(id&&C.ADOPT_FORM_ANIMAL_ENTRY)url+=(url.includes("?")?"&":"?")+"usp=pp_url&"+C.ADOPT_FORM_ANIMAL_ENTRY+"="+encodeURIComponent(id);return url};
const noForm=`<p class="empty">The form is not set up yet. Please call ${esc(C.PHONE)} instead.</p>`;

/* Views */
async function home(){app.innerHTML=`<section class="hero"><h1>${esc(C.CENTRE_NAME)}</h1><p class="tag">${esc(C.TAGLINE)}</p><p>A unit of ${esc(C.PARENT)}, ${esc(C.ADDRESS)}.</p>
<div class="row"><a class="btn emg" href="${PHONE_HREF}">Emergency helpline</a><a class="btn alt" href="https://wa.me/${esc(C.WHATSAPP)}" rel="noopener">WhatsApp</a><a class="btn must" href="#/animals">Meet our animals</a></div>
${C.EMERGENCY_24X7_CLAIM?"<p>Emergency response available 24x7.</p>":"<p><small>Please call to check availability.</small></p>"}</section>
<h2>Animals right now</h2><div id="st">${skel}</div><h2>Looking for a home</h2><div id="ft"></div>
<h2>What we do</h2><p>Emergency treatment, check-ups, vaccinations, minor surgeries and more. <a href="#/services">See all services</a>.</p>
<h2>How you can help</h2><p>Adopt or foster, volunteer, donate, or report an animal in need. <a href="#/get-involved">Get involved</a>.</p>`;
try{const L=await load(),by=s=>L.filter(a=>a.status===s).length;
$("#st").innerHTML='<div class="stats">'+["Adoptable","In care","Fostered","Adopted","Released after sterilisation"].map(s=>`<div class="stat"><b>${by(s)}</b>${s}</div>`).join("")+"</div>";
const f=L.filter(a=>a.status==="Adoptable").slice(0,3);$("#ft").innerHTML=f.length?'<div class="grid">'+f.map(card).join("")+"</div>":'<p class="empty">No animals are listed as adoptable right now.</p>'}
catch(e){$("#st").innerHTML=errBox("Could not load animals.")}}

const FIL=[["species","Species",["Dog","Cat","Other"]],["sex","Sex",["Male","Female","Unknown"]],["status","Status",["In care","Adoptable","Fostered","Adopted","Released after sterilisation"]],["size","Size",["Small","Medium","Large"]],["vaccinated","Vaccinated",["Yes","No","Partial"]],["sterilised","Sterilised",["Yes","No","Unknown"]]];
async function animals(){app.innerHTML=`<h1>Our Animals</h1><form class="filters" id="fl" onsubmit="return false"><div class="full"><label for="q">Search by name or ID</label><input id="q" type="search"></div>
${FIL.map(([k,l,o])=>`<div><label for="f_${k}">${l}</label><select id="f_${k}"><option value="">Any</option>${o.map(x=>`<option>${x}</option>`).join("")}</select></div>`).join("")}
<div><label for="sort">Sort</label><select id="sort"><option value="new">Newest first</option><option value="name">Name A-Z</option></select></div>
<div class="full"><label><input type="checkbox" id="all">Show all published animals (not only adoptable)</label></div></form>
<p id="cnt" aria-live="polite"></p><div id="res">${skel}</div>`;
let L;try{L=await load()}catch(e){$("#res").innerHTML=errBox("Could not load animals.");return}
const run=()=>{const q=$("#q").value.toLowerCase().trim(),all=$("#all").checked;
let r=L.filter(a=>(all||a.status==="Adoptable"||$("#f_status").value)&&(!q||(a.name+" "+a.animal_id).toLowerCase().includes(q))&&FIL.every(([k])=>!$("#f_"+k).value||a[k]===$("#f_"+k).value));
r.sort($("#sort").value==="name"?(x,y)=>x.name.localeCompare(y.name):(x,y)=>(y.last_updated||"").localeCompare(x.last_updated||""));
$("#cnt").textContent=r.length+(r.length===1?" animal found":" animals found");
$("#res").innerHTML=r.length?'<div class="grid">'+r.map(card).join("")+"</div>":'<p class="empty">No animals match. Try clearing a filter, or tick "Show all published animals".</p>'};
$("#fl").addEventListener("input",run);run()}

async function profile(id){app.innerHTML=skel;let L;try{L=await load()}catch(e){app.innerHTML=errBox("Could not load this profile.");return}
const a=L.find(x=>x.animal_id===id);
if(!a){app.innerHTML=`<h1>Animal not found</h1><p class="empty warn">We could not find a public profile for <b>${esc(id)}</b>. It may have been removed or not yet published.</p><p><a class="btn" href="#/animals">See all animals</a></p>`;return}
const url=C.SITE_BASE_URL+"/#/animal/"+a.animal_id,enq=formLink(C.ADOPT_FORM_URL,a.animal_id);
const rows=[["Species",a.species],["Sex",a.sex],["Approx. age",a.approx_age],["Size",a.size],["Colour",a.colour],["Description",a.breed_or_description],["Temperament",a.temperament],["Good with",a.good_with],["Special needs",a.special_needs],["Vaccinated",a.vaccinated],["Last vaccination",a.last_vaccination_date],["Sterilised",a.sterilised],["Ear-notched",a.ear_notched],["Area found",a.area_found]].filter(r=>r[1]);
app.innerHTML=`<article class="profile"><p><a href="#/animals">← All animals</a></p>${photo(a,"ph")}<h1>${esc(a.name)}</h1><p><span class="badge ${esc(a.status)}">${esc(a.status)}</span> ID ${esc(a.animal_id)}</p>
<dl class="facts">${rows.map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join("")}</dl>
${a.story?`<h2>Story</h2><p>${esc(a.story)}</p>`:""}<p><small>Last updated: ${esc(a.last_updated)}</small></p>
<div class="row">${enq?`<a class="btn must" href="${esc(enq)}" target="_blank" rel="noopener">Enquire to adopt or foster</a>`:'<a class="btn must" href="#/adopt">Enquire to adopt or foster</a>'}<button class="btn alt" id="sh">Share</button>
<a class="btn alt" href="mailto:${esc(C.EMAIL)}?subject=${encodeURIComponent("Problem with profile "+a.animal_id)}">Report a problem with this profile</a></div><p id="shm" aria-live="polite"></p></article>`;
$("#sh").onclick=async()=>{try{if(navigator.share)await navigator.share({title:a.name,url});else{await navigator.clipboard.writeText(url);$("#shm").textContent="Link copied."}}catch(e){$("#shm").textContent=url}}}

function adopt(){const f=formLink(C.ADOPT_FORM_URL);app.innerHTML=`<h1>Adopt or Foster</h1><ol><li>Send an enquiry (below).</li><li>The centre calls you.</li><li>You meet the animal.</li><li>${C.HOME_CHECK_REQUIRED===false?"No home check.":"A home check, if the centre requires one."}</li><li>Paperwork.</li></ol>
<p>${esc(C.ADOPTION_POLICY)||"Fees and policies: please call ahead."}</p>${f?`<p><a class="btn must" href="${esc(f)}" target="_blank" rel="noopener">Open enquiry form</a></p>`:noForm}`}
function report(){const f=C.REPORT_FORM_URL;app.innerHTML=`<h1>Report an Animal</h1><p class="empty warn"><b>Emergency?</b> Call first: <a href="${PHONE_HREF}">${esc(C.PHONE)}</a></p>
<h2>General safety guidance</h2><ul><li>Stay calm and keep your distance if the animal is frightened.</li><li>Do not force-feed or give medicine.</li><li>Keep the animal away from traffic if you can do so safely.</li><li>Send your location on WhatsApp.</li></ul><p><small>This is general guidance, not veterinary advice.</small></p>
${f?`<p><a class="btn must" href="${esc(f)}" target="_blank" rel="noopener">Fill rescue report form</a></p>`:noForm}`}
function services(){app.innerHTML=`<h1>Services</h1><ul>${["Emergency treatment","OPD consultations","Minor surgeries","Vaccinations","Deworming and flea/tick treatment","IPD care","Diagnostics (X-ray, blood panels)","Doorstep treatment and vaccination visits"].map(s=>`<li>${s}</li>`).join("")}</ul>
<p><b>Hours:</b> ${esc(call(C.HOURS))}<br><b>Free or paid:</b> ${esc(call(C.FEES_INFO))}</p>`}
function involved(){const d=C.DONATE,has=d.UPI||d.BANK||d.LINK;app.innerHTML=`<h1>Get Involved</h1><h2>Volunteer or foster</h2><p>Call or email us to ask how you can help. <a href="#/adopt">Adopt or foster</a>.</p>
${has?`<h2>Donate</h2><p>${d.UPI?"UPI: "+esc(d.UPI)+"<br>":""}${d.BANK?esc(d.BANK)+"<br>":""}${d.LINK?`<a href="${esc(d.LINK)}">Donation link</a>`:""}</p>`:""}`}
function about(){app.innerHTML=`<h1>About and Contact</h1><p>${esc(C.CENTRE_NAME)} is a unit of ${esc(C.PARENT)}, a Noida animal-welfare charity.</p><p>${esc(C.ADDRESS)}<br>${C.LANDMARK?esc(C.LANDMARK)+"<br>":""}<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.CENTRE_NAME+" "+C.ADDRESS)}" rel="noopener">Open in Google Maps</a></p>
<p>Phone: <a href="${PHONE_HREF}">${esc(C.PHONE)}</a><br>Email: <a href="mailto:${esc(C.EMAIL)}">${esc(C.EMAIL)}</a><br><a href="${esc(C.FACEBOOK)}" rel="noopener">Facebook</a> · <a href="${esc(C.INSTAGRAM)}" rel="noopener">Instagram</a></p><p><small>Contact details are being confirmed with the centre. Please call to confirm before visiting.</small></p>`}
async function tails(){app.innerHTML="<h1>Happy Tails</h1>"+skel;const L=(await load()).filter(a=>a.status==="Adopted");app.innerHTML="<h1>Happy Tails</h1>"+(L.length?'<div class="grid">'+L.map(card).join("")+"</div>":'<p class="empty">No adopted animals to show yet.</p>')}
function staff(){app.innerHTML=`<h1>Staff guide</h1><ol><li>Open the Google Sheet, tab "Animals".</li><li>Add a new row. Use the next ID (SH-0011, and so on). Never reuse an ID.</li><li>Pick values from the dropdowns. Dates look like 2025-01-31.</li><li>Paste a photo link in photo_url (optional).</li><li>Set published to Yes only when the centre approves.</li><li>Update last_updated. Changes appear on the site within a few minutes.</li></ol><p>To retire a record, set published to No. Do not delete the row.</p>`}

const routes={"":home,animals,adopt,report,services,"get-involved":involved,about,"happy-tails":tails,staff};
function route(){const h=location.hash.replace(/^#\/?/,""),[p,arg]=h.split("/");
$("#nav").classList.remove("open");$("#menu").setAttribute("aria-expanded","false");
$("#nav").innerHTML=NAV.map(([u,l])=>`<a href="${u}"${(u==="#/"+h||(u==="#/"&&!h))?' aria-current="page"':""}>${l}</a>`).join("");
const fn=p==="animal"?()=>profile(decodeURIComponent(arg||"")):routes[p];
if(fn)fn();else app.innerHTML='<h1>Page not found</h1><p><a class="btn" href="#/">Go home</a></p>';
window.scrollTo(0,0);app.focus({preventScroll:true});document.title=C.CENTRE_NAME;foot()}
async function foot(){let d="";try{d=(await load()).map(a=>a.last_updated).sort().pop()||""}catch(e){}
$("#footer").innerHTML=`<p>${esc(C.CENTRE_NAME)}, ${esc(C.ADDRESS)}</p><p>Information compiled by student volunteers; please call to confirm before visiting.</p>${d?`<p>Last updated: ${esc(d)}</p>`:""}`;
$("#banner").innerHTML=C.SHOW_SAMPLE_BANNER?'<div class="note" role="note">Sample data for demonstration. These are not real animals.</div>':""}
$("#emgBtn").href=PHONE_HREF;
$("#menu").onclick=()=>{const o=$("#nav").classList.toggle("open");$("#menu").setAttribute("aria-expanded",o)};
$("#theme").onclick=()=>{const r=document.documentElement,d=r.dataset.theme==="dark"||(!r.dataset.theme&&matchMedia("(prefers-color-scheme:dark)").matches);r.dataset.theme=d?"light":"dark"};
addEventListener("hashchange",route);route();
})();
