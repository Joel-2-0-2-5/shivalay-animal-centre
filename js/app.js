(function(){
"use strict";
const C=window.CONFIG,$=s=>document.querySelector(s),app=$("#main");
const BASE=(C.SITE_BASE_URL||"").replace(/\/+$/,"");
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const PH="tel:"+C.PHONE.replace(/[^\d+]/g,""),call=v=>v||"Please call ahead";
const SW=["Emergency treatment","OPD consultations","Minor surgeries","Vaccinations","Deworming and flea/tick treatment","IPD care","Diagnostics (X-ray, blood panels)","Doorstep treatment and vaccination visits"];
function parseCSV(t){const rows=[];let r=[],f="",q=false;t=t.replace(/^\uFEFF/,"");
for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c=='"'){if(t[i+1]=='"'){f+='"';i++}else q=false}else f+=c}
else if(c=='"')q=true;else if(c==","){r.push(f);f=""}else if(c=="\n"||c=="\r"){if(c=="\r"&&t[i+1]=="\n")i++;r.push(f);f="";if(r.some(x=>x!==""))rows.push(r);r=[]}else f+=c}
r.push(f);if(r.some(x=>x!==""))rows.push(r);const h=(rows.shift()||[]).map(x=>x.trim().toLowerCase());
return{h,rows:rows.map(a=>{const o={};h.forEach((k,i)=>o[k]=(a[i]||"").trim());return o})}}
let cache=null;
async function load(){if(cache)return cache;let rows=null;
if(C.ANIMALS_CSV_URL){try{const r=await fetch(C.ANIMALS_CSV_URL);if(!r.ok)throw 0;const p=parseCSV(await r.text());if(!p.h.includes("animal_id")||!p.rows.length)throw 0;rows=p.rows}catch(e){rows=null}}
if(!rows)rows=window.SAMPLE_ANIMALS||[];
cache=rows.filter(a=>/^SH-\d{4}$/.test(a.animal_id||"")&&String(a.published).trim().toLowerCase()==="yes").map(a=>{const m=(a.photo_url||"").match(/drive\.google\.com\/file\/d\/([\w-]+)/);if(m)a.photo_url="https://drive.google.com/thumbnail?id="+m[1]+"&sz=w800";return a});return cache}
const pic=a=>a.photo_url?`<img src="${esc(a.photo_url)}" alt="${esc(a.name)}, ${esc(a.species)}" loading="lazy" width="600" height="800" data-n="${esc((a.name||"?")[0])}">`:`<div class="ph" aria-hidden="true">${esc((a.name||"?")[0].toUpperCase())}</div>`;
document.addEventListener("error",e=>{const t=e.target;if(t.dataset&&t.dataset.n){const d=document.createElement("div");d.className="ph";d.textContent=t.dataset.n.toUpperCase();t.replaceWith(d)}},true);
const card=a=>`<a class="pc" href="#/animal/${esc(a.animal_id)}"><div class="pm">${pic(a)}</div><span class="id">${esc(a.animal_id)}</span><div class="pi"><span class="st">${esc(a.status)}</span><h3>${esc(a.name)}</h3></div></a>`;
const fl=(url,id)=>{if(!url)return"";if(id&&C.ADOPT_FORM_ANIMAL_ENTRY)url+=(url.includes("?")?"&":"?")+"usp=pp_url&"+C.ADOPT_FORM_ANIMAL_ENTRY+"="+encodeURIComponent(id);return url};
const noForm=`<p class="empty">This form is not set up yet. Please call <a href="${PH}">${esc(C.PHONE)}</a>.</p>`;
const head=(t,lead)=>`<section class="band night"><div class="wrap"><h1>${t}</h1>${lead?`<p class="mut">${lead}</p>`:""}</div></section>`;
const two=(l,r,cls="ivory")=>`<section class="band ${cls}"><div class="wrap two"><div>${l}</div><div>${r}</div></div></section>`;
const skel='<div class="wrap band"><div class="sk"></div></div>';

async function home(){app.innerHTML=`<section class="hero"><div class="wrap"><img src="images/logo.png" width="721" height="403" alt="Shivalay Animal Wellness Centre logo"><h1>${esc(C.TAGLINE)}</h1><div class="row"><a class="btn r" href="${PH}">Emergency helpline</a><a class="btn g" href="#/animals">Meet the Animals</a></div>${C.EMERGENCY_24X7_CLAIM?"<p class='mut' style='margin:auto'>Emergency response 24x7.</p>":""}</div></section>
${C.HERO_PHOTO?`<img src="${esc(C.HERO_PHOTO)}" alt="" loading="lazy" width="1200" height="500" style="width:100%;height:auto;display:block">`:""}
<section class="band ivory"><div class="wrap rv"><p class="eyebrow">Looking for a home</p><h2>Adoptable animals</h2><div class="rail" id="rail">${'<div class="sk" style="flex:0 0 70%"></div>'}</div><p><a href="#/animals">See all animals →</a></p></div></section>
<section class="band ind"><div class="wrap rv"><p class="eyebrow">Right now</p><div class="nums" id="nums"></div></div></section>
<section class="band ivory"><div class="wrap rv"><p class="eyebrow">Care &amp; Services</p><ol class="svc">${SW.map((s,i)=>`<li><b>${String(i+1).padStart(2,"0")}</b>${s}</li>`).join("")}</ol></div></section>
<section class="band gold"><div class="wrap rv"><h2>${esc(C.TAGLINE)}</h2><a class="btn k" href="#/take-action">Take Action</a></div></section>`;
try{const L=await load(),by=s=>L.filter(a=>a.status===s).length,ad=L.filter(a=>a.status==="Adoptable").slice(0,8);
$("#rail").innerHTML=ad.length?ad.map(card).join(""):'<p class="empty">No animals are listed as adoptable right now.</p>';
$("#nums").innerHTML=["Adoptable","In care","Fostered","Adopted","Released after sterilisation"].map(s=>`<div><b>${by(s)}</b>${s}</div>`).join("")}catch(e){}}

const F=["species","sex","status","size","vaccinated","sterilised"],O={sex:["Male","Female","Unknown"],status:["In care","Adoptable","Fostered","Adopted","Released after sterilisation"],size:["Small","Medium","Large"],vaccinated:["Yes","No","Partial"],sterilised:["Yes","No","Unknown"]};
async function animals(){let sp="";app.innerHTML=`${head("Meet the Animals")}<section class="band ivory"><div class="wrap"><button class="btn k" id="fbtn" aria-expanded="false" aria-controls="fl">Filter</button><div class="layout"><form id="fl" onsubmit="return false" aria-label="Filters"><button class="btn k" id="fx" type="button">Close filters</button>
<div><label for="q">Search by name or ID</label><input id="q" type="search"></div>${Object.keys(O).map(k=>`<div><label for="f_${k}">${k[0].toUpperCase()+k.slice(1)}</label><select id="f_${k}"><option value="">Any</option>${O[k].map(x=>`<option>${x}</option>`).join("")}</select></div>`).join("")}
<div><label for="so">Sort</label><select id="so"><option value="new">Newest</option><option value="name">Name</option></select></div><label><input type="checkbox" id="all" style="width:auto;min-height:0"> Show all published animals</label></form>
<div><div class="tabs" role="group" aria-label="Species">${[["","All"],["Dog","Dogs"],["Cat","Cats"],["Other","Other"]].map(([v,l])=>`<button type="button" data-sp="${v}" aria-pressed="${v===""}">${l}</button>`).join("")}</div><p id="cnt" aria-live="polite" class="mut"></p><div id="res" class="mas"><div class="sk"></div></div></div></div></div></section>`;
let L;try{L=await load()}catch(e){$("#res").innerHTML='<p class="empty" role="alert">Could not load animals.</p>';return}
const run=()=>{const q=$("#q").value.toLowerCase().trim(),all=$("#all").checked,sv=$("#f_status").value;
let r=L.filter(a=>(all||sv||a.status==="Adoptable")&&(!sp||a.species===sp)&&(!q||(a.name+" "+a.animal_id).toLowerCase().includes(q))&&Object.keys(O).every(k=>!$("#f_"+k).value||a[k]===$("#f_"+k).value));
r.sort($("#so").value==="name"?(x,y)=>x.name.localeCompare(y.name):(x,y)=>(y.last_updated||"").localeCompare(x.last_updated||""));
$("#cnt").textContent=r.length+(r.length===1?" animal found":" animals found");$("#res").className=r.length?"mas":"";
$("#res").innerHTML=r.length?r.map(card).join(""):'<p class="empty">No animals match these filters. Try "Show all published animals" or clear a filter.</p>'};
$("#fl").addEventListener("input",run);
document.querySelectorAll("[data-sp]").forEach(b=>b.onclick=()=>{sp=b.dataset.sp;document.querySelectorAll("[data-sp]").forEach(x=>x.setAttribute("aria-pressed",x===b));run()});
const sh=o=>{$("#fl").classList.toggle("open",o);$("#fbtn").setAttribute("aria-expanded",o);if(o)$("#q").focus()};
$("#fbtn").onclick=()=>sh(true);$("#fx").onclick=()=>{sh(false);$("#fbtn").focus()};run()}

async function profile(id){app.innerHTML=skel;let L;try{L=await load()}catch(e){L=[]}
const a=L.find(x=>x.animal_id===id);
if(!a){app.innerHTML=head("Animal not found")+`<section class="band ivory"><div class="wrap"><p class="empty">We could not find a public profile for <b>${esc(id)}</b>. It may have been removed or not yet published.</p><p><a class="btn k" href="#/animals">See all animals</a></p></div></section>`;return}
const url=BASE+"/#/animal/"+a.animal_id,enq=fl(C.ADOPT_FORM_URL,a.animal_id)||"#/adopt",ext=enq[0]!=="#"?' target="_blank" rel="noopener"':"";
const rows=[["Species",a.species],["Sex",a.sex],["Approx. age",a.approx_age],["Size",a.size],["Colour",a.colour],["Description",a.breed_or_description],["Temperament",a.temperament],["Good with",a.good_with],["Special needs",a.special_needs],["Area found",a.area_found]].filter(r=>r[1]);
const yn=(l,v,t)=>`<li class="${v==="Yes"||v==="Partial"?"":"no"}">${l}: ${esc(v||"Unknown")}${t||""}</li>`;
const mail=`mailto:${esc(C.EMAIL)}?subject=${encodeURIComponent("Problem with profile "+a.animal_id)}`;
app.innerHTML=`<section class="band ivory prof-pad"><div class="wrap prof"><div class="pt"><div class="pm">${pic(a)}</div></div><div><p class="eyebrow">${esc(a.status)} · ${esc(a.animal_id)}</p><h1>${esc(a.name)}</h1>
<dl class="f">${rows.map(r=>`<dt>${r[0]}</dt><dd>${esc(r[1])}</dd>`).join("")}</dl><h2 style="margin-top:1em">Health</h2><ul class="tick">${yn("Vaccinated",a.vaccinated,a.last_vaccination_date?" (last: "+esc(a.last_vaccination_date)+")":"")}${yn("Sterilised",a.sterilised)}${yn("Ear-notched",a.ear_notched)}</ul>
${a.story?`<h2>Story</h2><p>${esc(a.story)}</p>`:""}<p class="mut">Last updated: ${esc(a.last_updated)}</p>
<div class="row"><a class="btn k" href="${esc(enq)}"${ext}>Enquire to adopt or foster</a><button class="btn" id="sh">Share</button><a class="btn" href="${mail}">Report a problem with this profile</a></div><p id="shm" aria-live="polite"></p></div></div></section>
<div class="abar"><a class="btn g" href="${esc(enq)}"${ext}>Enquire</a><button class="btn" id="sh2" style="color:#F7F1E3">Share</button></div>`;
const share=async()=>{try{if(navigator.share)await navigator.share({title:a.name,url});else{await navigator.clipboard.writeText(url);$("#shm").textContent="Link copied."}}catch(e){$("#shm").textContent=url}};
$("#sh").onclick=share;$("#sh2").onclick=share}

const hrs=()=>`<p><b>Hours:</b> ${esc(call(C.HOURS))}<br><b>Free or paid:</b> ${esc(call(C.FEES_INFO))}</p>`;
const care=()=>{app.innerHTML=head("Care &amp; Services")+two(`<h2>In an emergency</h2><p>Call first: <a href="${PH}"><b>${esc(C.PHONE)}</b></a></p>${hrs()}<p class="mut">Details are being confirmed with the centre.</p>`,`<ol class="svc">${SW.map((s,i)=>`<li><b>${String(i+1).padStart(2,"0")}</b>${s}</li>`).join("")}</ol>`)};
const takeAction=()=>{app.innerHTML=head("Take Action")+`<section class="band night"><div class="wrap big"><a href="#/report">Report an animal in need</a><a href="#/adopt">Adopt or foster</a><a href="#/volunteer">Volunteer</a><a href="#/donate">Donate</a></div></section>`};
const report=()=>{const f=C.REPORT_FORM_URL;app.innerHTML=head("Report an animal in need")+`<section class="band ivory"><div class="wrap"><a class="btn r" href="${PH}" style="width:100%;justify-content:center;font-size:1.3rem">Call the helpline ${esc(C.PHONE)}</a><h2 style="margin-top:1.2em">While you wait</h2><ul class="tick"><li>Stay calm and keep your distance if the animal is frightened.</li><li>Do not force-feed or give medicine.</li><li>Keep the animal away from traffic if it is safe for you to do so.</li><li>Send your location on WhatsApp.</li></ul><p class="mut">General guidance, not veterinary advice.</p>${f?`<a class="btn k" href="${esc(f)}" target="_blank" rel="noopener">Fill in the rescue report form</a>`:noForm}</div></section>`};
const adopt=()=>{const f=C.ADOPT_FORM_URL;const st=["Send an enquiry","The centre calls you","You meet the animal",C.HOME_CHECK_REQUIRED===false?"No home check needed":"A home check, if the centre requires one","Paperwork"];
app.innerHTML=head("Adopt or foster")+two(`<h2>How it works</h2><p>${esc(C.ADOPTION_POLICY)||"Fees and policies: please call ahead."}</p>${f?`<a class="btn k" href="${esc(f)}" target="_blank" rel="noopener">Open enquiry form</a>`:noForm}`,`<ol class="steps">${st.map((s,i)=>`<li><b>${i+1}</b>${s}</li>`).join("")}</ol>`)};
const volunteer=()=>{app.innerHTML=head("Volunteer")+`<section class="band ivory"><div class="wrap"><p>${esc(C.VOLUNTEER_INFO)||"To help at the centre, please contact us."}</p><a class="btn k" href="#/visit">Contact us</a></div></section>`};
const donate=()=>{const d=C.DONATE||{},has=d.UPI||d.BANK||d.LINK;app.innerHTML=head("Donate")+`<section class="band ivory"><div class="wrap">${has?`<p>${d.UPI?"UPI: <b>"+esc(d.UPI)+"</b><br>":""}${d.BANK?esc(d.BANK)+"<br>":""}${d.LINK?`<a class="btn k" href="${esc(d.LINK)}" rel="noopener">Donate online</a>`:""}</p>`:'<p>To donate, please contact us.</p><a class="btn k" href="#/visit">Contact us</a>'}</div></section>`};
const story=()=>{app.innerHTML=head("Our Story")+`<section class="band ivory"><div class="wrap"><img src="images/logo.png" width="540" height="302" alt="Shivalay Animal Wellness Centre logo" style="max-width:100%;height:auto;margin-bottom:24px"><p>${esc(C.CENTRE_NAME)} is a unit of ${esc(C.PARENT)}, an animal-welfare charity in Noida.</p>${C.STORY_TEXT?`<p>${esc(C.STORY_TEXT)}</p>`:""}<blockquote class="bigaddr" style="margin:1em 0">${esc(C.TAGLINE)}</blockquote></div></section>`};
const visit=()=>{const L=(u,t)=>u?`<a href="${esc(u)}" rel="noopener">${t}</a>`:"";app.innerHTML=head("Visit &amp; Contact")+`<section class="band ivory"><div class="wrap"><p class="bigaddr">${esc(C.ADDRESS)}</p>${C.LANDMARK?`<p>${esc(C.LANDMARK)}</p>`:""}<p><a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(C.CENTRE_NAME+" "+C.ADDRESS)}" rel="noopener">Open in Google Maps</a></p>
<p>Phone: <a href="${PH}">${esc(C.PHONE)}</a><br>WhatsApp: <a href="https://wa.me/${esc(C.WHATSAPP)}" rel="noopener">message us</a><br>Email: <a href="mailto:${esc(C.EMAIL)}">${esc(C.EMAIL)}</a><br>${[L(C.FACEBOOK,"Facebook"),L(C.INSTAGRAM,"Instagram")].filter(Boolean).join(" · ")}</p>${hrs()}<p class="mut">Details are being confirmed with the centre. Please call before visiting.</p></div></section>`};
const how=()=>{app.innerHTML=head("How we work")+`<section class="band ivory"><div class="wrap"><ol class="steps"><li><b>1</b><span><strong>Someone reports an animal in need</strong><br>A call to the helpline or a report through the rescue form tells the centre that an animal needs help.</span></li><li><b>2</b><span><strong>Emergency treatment or a check-up</strong><br>The animal receives emergency treatment or an OPD consultation.</span></li><li><b>3</b><span><strong>Tests and in-patient care</strong><br>Where needed, diagnostics such as X-ray and blood panels, and IPD care.</span></li><li><b>4</b><span><strong>Routine and minor care</strong><br>Vaccinations, deworming, flea and tick treatment, and minor surgeries.</span></li><li><b>5</b><span><strong>What happens next</strong><br>Each animal's profile shows its status: In care, Adoptable, Fostered, Adopted, or Released after sterilisation.</span></li></ol><p>The centre also offers doorstep treatment and vaccination visits.</p><p class="mut">This is a general outline. Details are being confirmed with the centre; please call to check.</p></div></section>`};
const tails=async()=>{app.innerHTML=head("Happy Tails");const L=(await load()).filter(a=>a.status==="Adopted");app.insertAdjacentHTML("beforeend",`<section class="band ivory"><div class="wrap">${L.length?'<div class="mas">'+L.map(card).join("")+"</div>":'<p class="empty">No adopted animals to show yet.</p>'}</div></section>`)};

const R={"":home,animals,care,"take-action":takeAction,report,adopt,volunteer,donate,story,visit,"how-we-work":how,"happy-tails":tails},LEG={staff:"how-we-work",services:"care",about:"story","get-involved":"take-action"};
function route(){const h=location.hash.replace(/^#\/?/,""),p=h.split("/")[0],arg=h.split("/")[1];
if(LEG[p]){location.replace("#/"+LEG[p]);return}
$("#nav").classList.remove("open");$("#menu").setAttribute("aria-expanded","false");$("#menu").textContent="Menu";$(".dd").classList.remove("open");
document.querySelectorAll("#nav a").forEach(a=>a.getAttribute("href")==="#/"+h||(!h&&a.getAttribute("href")==="#/")?a.setAttribute("aria-current","page"):a.removeAttribute("aria-current"));
const fn=p==="animal"?()=>profile(decodeURIComponent(arg||"")):R[p];
if(fn)fn();else app.innerHTML=head("Page not found")+'<section class="band ivory"><div class="wrap"><a class="btn k" href="#/">Go home</a></div></section>';
window.scrollTo(0,0);app.focus({preventScroll:true});foot();
requestAnimationFrame(()=>setTimeout(()=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}}));document.querySelectorAll(".rv").forEach(x=>io.observe(x))},50))}
async function foot(){let d="";try{d=(await load()).map(a=>a.last_updated).sort().pop()||""}catch(e){}
$("#footer").innerHTML=`<div class="wrap"><img src="images/logo.png" width="100" height="56" alt="Shivalay Animal Wellness Centre logo"><p>${esc(C.ADDRESS)}</p><p><a href="#/visit">Visit &amp; Contact</a> · <a href="#/report">Report an animal</a> · <a href="#/how-we-work">How we work</a></p><small>Information compiled by student volunteers; please call to confirm before visiting.${d?" Last updated: "+esc(d)+".":""}</small></div>`;
$("#banner").innerHTML=C.SHOW_SAMPLE_BANNER?'<div class="note" role="note">Sample data for demonstration. These are not real animals.</div>':""}
$("#emg").href=PH;if(C.SHOW_HAPPY_TAILS)$("#ht").innerHTML='<a href="#/happy-tails">Happy Tails</a>';
const nav=$("#nav"),mb=$("#menu");
mb.onclick=()=>{const o=nav.classList.toggle("open");mb.setAttribute("aria-expanded",o);mb.textContent=o?"Close":"Menu";if(o)nav.querySelector("a").focus()};
$("#ddb").onclick=()=>{const o=$(".dd").classList.toggle("open");$("#ddb").setAttribute("aria-expanded",o)};
document.addEventListener("keydown",e=>{if(e.key==="Escape"){nav.classList.remove("open");mb.setAttribute("aria-expanded","false");mb.textContent="Menu";$(".dd").classList.remove("open");const f=$("#fl");if(f)f.classList.remove("open")}
if(e.key==="Tab"&&nav.classList.contains("open")&&innerWidth<1000){const x=[mb,...nav.querySelectorAll("a,button,input")].filter(n=>n.offsetParent),a=x[0],z=x[x.length-1];if(e.shiftKey&&document.activeElement===a){z.focus();e.preventDefault()}else if(!e.shiftKey&&document.activeElement===z){a.focus();e.preventDefault()}}});
$("#lk").onsubmit=e=>{e.preventDefault();let v=$("#lki").value.trim().toUpperCase();if(/^\d{1,4}$/.test(v))v="SH-"+v.padStart(4,"0");if(v){location.hash="#/animal/"+v;$("#lki").value=""}};
addEventListener("scroll",()=>$("#hdr").classList.toggle("sm",scrollY>40),{passive:true});
addEventListener("hashchange",route);route();
})();
