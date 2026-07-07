/* ============================================================
   FURA HANDBÓK — frumgerð (prototype)
   ------------------------------------------------------------
   Sýnishorn til að prófa flæðið og útlitið. Gögn vistast á
   þessu tæki (localStorage). Næsta skref: tengja við Supabase
   svo allir deili sömu handbók á netinu.

   BYGGING: allt er "hnútur" (node). Hnútur getur innihaldið
   aðra hnúta (vél inni í vél / hlutar) — eins djúpt og þarf.
   Hver hnútur hefur líka sínar eigin myndir, bilanaleit og
   varahluti.

   Kóðar og gögn eru geymd í Supabase (sjá supabase-setup.sql).
   ============================================================ */

/* ============================================================
   Sýnishorn af gögnum (verður sótt úr Supabase síðar)
   ============================================================ */
const SEED = {
  tree: [
    {
      id:'taetarinn', name:'Tætarinn', photo:'',
      summary:'Stór tætari sem rífur brotamálm niður í smáa bita.',
      children:[
        { id:'taetari-motor', name:'Mótor og drif', photo:'',
          summary:'Aflið á bak við tætarann.',
          children:[],
          angles:[ {id:'a1',photo:'',label:'Beltin',text:'Athugaðu beltaspennu vikulega — of laus belti renna og slitna.'} ],
          troubleshooting:[ {id:'t1',problem:'Mótor fer í gang en haus snýst ekki',fix:'Líklega slitið/brotið belti. Stöðvaðu og yfirfaraðu beltin.'} ],
          parts:[ {id:'p1',name:'Drifbelti',supplier:'Vélaver',partno:'',url:'',note:'Mældu breidd og lengd áður en þú pantar.'} ],
          notes:'' },
        { id:'taetari-haus', name:'Tætarahaus (hnífar)', photo:'',
          summary:'Hnífarnir sem rífa málminn.',
          children:[],
          angles:[ {id:'a1',photo:'',label:'Hnífar að ofan',text:'Slökktu ALLTAF og læstu (lockout) áður en þú opnar hausinn.'} ],
          troubleshooting:[],
          parts:[ {id:'p1',name:'Tætarahnífar / tennur',supplier:'',partno:'',url:'',note:'Slitna með tíma — gott að eiga varahníf á lager.'} ],
          notes:'' }
      ],
      angles:[
        { id:'a1', photo:'', label:'Framan / stjórnborð', text:'Hér er ræst og stöðvað. Rauði takkinn er neyðarstopp — slær allt af strax.' },
        { id:'a2', photo:'', label:'Innmötun (færiband)', text:'Málmurinn fer hér inn. Aldrei standa beint fyrir framan opið þegar vélin gengur — efni getur kastast út.' }
      ],
      troubleshooting:[
        { id:'t1', problem:'Fer ekki í gang', fix:'Athugaðu neyðarstopp (snúðu rauða takkanum réttsælis) og aðalrofa á vegg. Athugaðu líka hvort hlíf/lúga sé almennilega lokuð (öryggisrofi).' },
        { id:'t2', problem:'Stíflast / stöðvast undir álagi', fix:'Of mikið efni í einu. Bakkaðu (reverse) ef hægt er, og hreinsaðu opið með vélina stöðvaða og læsta.' }
      ],
      parts:[],
      notes:'Hreinsaðu svæðið eftir hverja vakt. Yfirfaraðu hnífa og beltaspennu vikulega. Aldrei opna meðan vélin er í gangi.'
    },
    {
      id:'furuflis', name:'Furuflís', photo:'',
      summary:'Stór salur með mörgum vélum.',
      children:[
        {
          id:'pressa', name:'Málmpressa', photo:'',
          summary:'Pressar lausan málm í þétta bagga fyrir flutning.',
          children:[],
          angles:[
            { id:'a1', photo:'', label:'Framan frá', text:'Stjórnborðið er hér. Græni takkinn ræsir, rauði stöðvar strax (neyðarstopp).' },
            { id:'a2', photo:'', label:'Hleðsluop', text:'Settu málminn hér inn. Aldrei setja hendur inn fyrir gula strikið þegar vélin er í gangi.' },
            { id:'a3', photo:'', label:'Vökvakerfi (aftan)', text:'Olíustaðan á að vera milli merkjanna. Athugaðu fyrir hverja vakt.' }
          ],
          troubleshooting:[
            { id:'t1', problem:'Vélin fer ekki í gang', fix:'Athugaðu hvort neyðarstoppið sé úti (snúðu rauða takkanum réttsælis). Athugaðu líka aðalrofa á vegg.' },
            { id:'t2', problem:'Pressan er kraftlaus / hæg', fix:'Líklega lág olíustaða eða loft í kerfinu. Athugaðu olíu aftan á vélinni og láttu vita ef hún er lág.' }
          ],
          parts:[
            { id:'p1', name:'Vökvaolía (ISO 46)', supplier:'Olís', partno:'', url:'', note:'Algeng olía, til á lager hjá flestum.' },
            { id:'p2', name:'Þéttisett í tjakk', supplier:'Vélaver', partno:'TS-220', url:'', note:'Pantast, getur tekið nokkra daga.' }
          ],
          notes:'Hreinsaðu málmafganga úr hleðsluopi í lok hverrar vaktar. Smyrjið liði vikulega.'
        },
        { id:'klippa', name:'Málmklippa (skæri)', photo:'', summary:'Klippir langt járn og prófíla niður í hæfilega búta.',
          children:[], angles:[], troubleshooting:[], parts:[], notes:'' }
      ],
      angles:[], troubleshooting:[], parts:[], notes:''
    },
    {
      id:'skemman', name:'Skemman', photo:'',
      summary:'Skemman / geymslan.',
      children:[
        { id:'lyftari', name:'Lyftari', photo:'', summary:'Notaður til að færa bagga og efni um svæðið.',
          children:[], angles:[], troubleshooting:[], parts:[], notes:'' }
      ],
      angles:[], troubleshooting:[], parts:[], notes:''
    }
  ]
};

/* ============================================================
   Geymsla (localStorage)
   ============================================================ */
const SUPA = window.FURA_SUPABASE || {};
const db = (window.supabase && SUPA.url) ? window.supabase.createClient(SUPA.url, SUPA.key) : null;

const CACHE_KEY  = 'fura_handbok_cache_v1';   // afrit af handbók (hraði + ónettengt lestur)
const UNLOCK_KEY = 'fura_handbok_unlock_v1';  // { role, code }

let DATA = { tree: [] };
let MODE = 'locked';      // locked | view | edit
let UNLOCK_CODE = null;   // kóðinn sem var sleginn inn (notaður við vistun)

function normalize(d){ d = d || {tree:[]}; if(!Array.isArray(d.tree)) d.tree = []; return d; }
function cacheData(){ try{ localStorage.setItem(CACHE_KEY, JSON.stringify(DATA)); }catch(e){} }
function loadCache(){ try{ const r = localStorage.getItem(CACHE_KEY); if(r) return JSON.parse(r); }catch(e){} return null; }

async function fetchHandbook(code){
  const { data, error } = await db.rpc('get_handbook', { p_code: code });
  if(error) throw error;
  return data; // null ef rangur kóði, annars { role, data }
}

async function saveData(){
  cacheData();                                       // strax staðbundið (öryggi + hraði)
  if(MODE !== 'edit' || !UNLOCK_CODE || !db) return;
  try{
    const { error } = await db.rpc('save_handbook', { p_code: UNLOCK_CODE, p_data: DATA });
    if(error) throw error;
  }catch(e){ toast('Vistun mistókst — engin nettenging?'); }
}

/* ============================================================
   Hjálparföll
   ============================================================ */
const $ = (sel, el=document) => el.querySelector(sel);
const app = $('#app');
const uid = () => Math.random().toString(36).slice(2,9);
const esc = (s) => (s||'').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function nl2br(s){ return esc(s).replace(/\n/g,'<br>'); }
function linkify(s){ return nl2br(s).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>'); }
const isEdit = () => MODE === 'edit';

function emptyNode(name){
  return { id:uid(), name:(name||'').trim(), photo:'', summary:'', children:[], notes:'', contacts:[] };
}

function toast(msg){
  let t = $('.toast');
  if(!t){ t = document.createElement('div'); t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.remove('show'), 1600);
}

// velur skrá úr síma/tölvu
function pickFile(){
  return new Promise((resolve)=>{
    const inp = document.createElement('input');
    inp.type='file'; inp.accept='image/*'; inp.capture='environment';
    inp.onchange = () => resolve(inp.files && inp.files[0] ? inp.files[0] : null);
    inp.click();
  });
}
// minnkar mynd í litla JPEG (Blob)
function compressToBlob(file, maxDim=1600, quality=0.8){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    img.onload = () => {
      let {width:w, height:h} = img;
      if(w > maxDim || h > maxDim){
        if(w >= h){ h = Math.round(h*maxDim/w); w = maxDim; }
        else { w = Math.round(w*maxDim/h); h = maxDim; }
      }
      const c = document.createElement('canvas'); c.width=w; c.height=h;
      c.getContext('2d').drawImage(img, 0, 0, w, h);
      c.toBlob(b => b ? resolve(b) : reject(new Error('blob')), 'image/jpeg', quality);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
// minnkar og hleður upp í Supabase, skilar opinberri vefslóð
async function uploadPhoto(file){
  const blob = await compressToBlob(file);
  const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;
  const { error } = await db.storage.from('photos').upload(name, blob, { contentType:'image/jpeg', upsert:false });
  if(error) throw error;
  return db.storage.from('photos').getPublicUrl(name).data.publicUrl;
}
// velur -> hleður upp -> skilar vefslóð (eða null)
async function pickAndUpload(){
  const file = await pickFile();
  if(!file) return null;
  if(!db){ toast('Engin nettenging'); return null; }
  toast('Hleð upp mynd…');
  try{ const url = await uploadPhoto(file); toast('Mynd komin ✓'); return url; }
  catch(e){ toast('Tókst ekki að hlaða upp mynd'); return null; }
}

function photoBlock(src, cls, phIcon='▲'){
  if(src) return `<div class="${cls}"><img src="${src}" alt=""></div>`;
  return `<div class="${cls}"><div class="card__ph">${phIcon}</div></div>`;
}

/* ============================================================
   Tré-hjálparföll
   ============================================================ */
// finnur hnút eftir slóð af id-um. skilar {node, chain, parentArr}
function resolve(path){
  let arr = DATA.tree, node = null; const chain = [];
  for(const id of path){
    const found = (arr||[]).find(n => n.id === id);
    if(!found) return null;
    node = found; chain.push(found); arr = found.children || (found.children = []);
  }
  let parentArr = DATA.tree;
  for(let i=0;i<path.length-1;i++){ parentArr = parentArr.find(n=>n.id===path[i]).children; }
  return { node, chain, parentArr };
}
// flatt yfirlit yfir alla hnúta með slóð + leiðarlýsingu (fyrir leit)
function flatten(nodes=DATA.tree, prefix=[], crumb=[]){
  let out = [];
  for(const n of nodes){
    const path = [...prefix, n.id];
    out.push({ node:n, path, crumbs: crumb.join(' · ') });
    if(n.children && n.children.length) out = out.concat(flatten(n.children, path, [...crumb, n.name]));
  }
  return out;
}

/* ============================================================
   Router
   ============================================================ */
function parseHash(){
  return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
}
function go(hash){ location.hash = hash; }

function render(){
  if(MODE === 'locked'){ renderLock(); return; }
  setChrome(true);
  const p = parseHash();
  if(p[0] === 'leit'){ renderSearch(); }
  else if(p[0] === 'n'){ renderNode(p.slice(1)); }
  else { renderHome(); }
  window.scrollTo(0,0);
}

function setChrome(show){
  $('#topbar').hidden = !show;
  $('#footer').hidden = !show;
  const badge = $('#modeBadge');
  badge.textContent = isEdit() ? '✏️ Breytingar' : 'Lestur';
  badge.className = 'modebadge' + (isEdit() ? ' edit' : '');
  $('#lockBtn').hidden = !show;
  $('#searchBtn').hidden = !show;
  $('#backBtn').hidden = !(show && parseHash().length);
}

/* ============================================================
   Lás / kóðaskjár
   ============================================================ */
function renderLock(){
  setChrome(false);
  app.innerHTML = `
    <div class="lock">
      <div class="lock__logo">▲</div>
      <h1>FURA</h1>
      <p>Handbók véla og tækja</p>
      <div class="codebox" id="codebox">
        ${[0,1,2,3].map(i=>`<input inputmode="numeric" maxlength="1" data-i="${i}">`).join('')}
      </div>
      <div class="lock__msg" id="lockMsg"></div>
      <div class="lock__hint">Sláðu inn 4 stafa kóða.<br>Lestrarkóði opnar handbókina. Breytingakóði leyfir líka að bæta við og laga.</div>
    </div>`;
  const inputs = [...document.querySelectorAll('#codebox input')];
  inputs[0].focus();
  inputs.forEach((inp, i)=>{
    inp.addEventListener('input', ()=>{
      inp.value = inp.value.replace(/\D/g,'');
      if(inp.value && i < 3) inputs[i+1].focus();
      if(inputs.every(x=>x.value)) tryCode(inputs.map(x=>x.value).join(''));
    });
    inp.addEventListener('keydown', (e)=>{ if(e.key === 'Backspace' && !inp.value && i>0) inputs[i-1].focus(); });
  });
}
async function tryCode(code){
  const msg = $('#lockMsg');
  if(!db){ if(msg) msg.textContent = 'Engin tenging við netþjón'; return; }
  if(msg) msg.textContent = 'Athuga…';
  let res;
  try{ res = await fetchHandbook(code); }
  catch(e){ if(msg) msg.textContent = 'Villa við tengingu — reyndu aftur'; return; }
  if(!res){
    if(msg) msg.textContent = 'Rangur kóði — reyndu aftur';
    document.querySelectorAll('#codebox input').forEach(x=>x.value='');
    const f = document.querySelector('#codebox input'); if(f) f.focus();
    return;
  }
  MODE = res.role; UNLOCK_CODE = code; DATA = normalize(res.data);
  // ef handbókin er tóm og þú mátt breyta -> settu inn sýnishorn í fyrsta sinn
  if(MODE === 'edit' && DATA.tree.length === 0){ DATA = normalize(JSON.parse(JSON.stringify(SEED))); await saveData(); }
  cacheData();
  localStorage.setItem(UNLOCK_KEY, JSON.stringify({ role:MODE, code }));
  go('#/'); render();
  toast(MODE === 'edit' ? 'Breytingar virkar ✏️' : 'Velkomin/n');
}
function lock(){ MODE='locked'; UNLOCK_CODE=null; localStorage.removeItem(UNLOCK_KEY); render(); }

/* ============================================================
   Forsíða
   ============================================================ */
function renderHome(){
  const cards = DATA.tree.map(n => cardFor(n, [n.id])).join('');
  const add = isEdit() ? `<button class="card card--add" id="addTop"><span>＋</span>Bæta við stað / vél</button>` : '';
  app.innerHTML = `
    <div class="page-head">
      <h1>Fura handbók</h1>
      <p>Veldu stað eða vél — eða leitaðu efst.</p>
    </div>
    <div class="grid">${cards}${add}</div>`;
  if(isEdit()) $('#addTop').onclick = ()=>addChildTo(DATA.tree, renderHome);
}

function cardFor(n, path){
  const kids = (n.children && n.children.length) || 0;
  const branch = kids > 0;
  return `
    <a class="card ${branch?'card--branch':'card--leaf'}" href="#/n/${path.join('/')}">
      ${photoBlock(n.photo,'card__photo','⚙')}
      <div class="card__body">
        <div class="card__title">${esc(n.name)}</div>
        ${branch?`<div class="card__more">${kids} ${kids===1?'vél inni':'vélar inni'} ›</div>`:''}
      </div>
    </a>`;
}

function addChildTo(arr, rerender){
  const name = prompt('Nafn (vél, staður eða hlutur):');
  if(!name) return;
  arr.push(emptyNode(name));
  saveData(); rerender(); toast('Bætt við');
}

/* ============================================================
   Hnútasíða — vél / staður / hlutur
   ============================================================ */
function renderNode(path){
  const r = resolve(path);
  if(!r){ go('#/'); return; }
  const node = r.node;
  node.children = node.children || [];
  node.contacts = node.contacts || [];
  const ancestors = r.chain.slice(0, -1);
  const crumbs = ['Forsíða', ...ancestors.map(a=>esc(a.name))].join(' · ');
  const rerender = ()=>renderNode(path);

  const childCards = node.children.map(c => cardFor(c, [...path, c.id])).join('');
  const addChild = isEdit() ? `<button class="card card--add" id="addChild"><span>＋</span>Bæta við vél</button>` : '';
  const showChildren = node.children.length || isEdit();

  app.innerHTML = `
    <div class="crumbs">${crumbs}</div>
    <div class="hero">
      ${photoBlock(node.photo,'hero__photo')}
      <div class="hero__body">
        <h1>${esc(node.name)}</h1>
        <div id="summaryField"></div>
        ${isEdit()?`<div class="editrow">
          <button class="editbtn" id="heroPhoto">📷 Aðalmynd</button>
          <button class="editbtn" id="renameNode">✏️ Nafn</button>
          <button class="delbtn" id="deleteNode">🗑️ Eyða þessu</button>
        </div>`:''}
      </div>
    </div>

    ${showChildren ? `<div class="section">
      <div class="section__head"><span class="section__icon">📂</span><h2>Vélar</h2></div>
      <div class="grid">${childCards || (isEdit()?'':'<p class="empty">Ekkert skráð enn.</p>')}${addChild}</div>
    </div>` : `<div class="leaf-note">Engar fleiri vélar hér inni — allar upplýsingar eru á þessari síðu.</div>`}

    <div class="section">
      <div class="section__head"><span class="section__icon">📝</span><h2>Athugasemdir</h2></div>
      <div id="notesField" class="notecard"></div>
    </div>

    <div class="section">
      <div class="section__head"><span class="section__icon">👥</span><h2>Tengiliðir</h2></div>
      <div id="contacts"></div>
      ${isEdit()?`<button class="addbtn" id="addContact">＋ Bæta við tengilið</button>`:''}
    </div>`;

  mountEditableText($('#summaryField'), node.summary, 'Stutt lýsing…', (v)=>{ node.summary=v; saveData(); });
  const notesHost = $('#notesField');
  mountEditableText(notesHost, node.notes, 'Skrifaðu athugasemdir…', (v)=>{ node.notes=v; saveData(); });
  if(!isEdit() && !(node.notes||'').trim()){ notesHost.classList.remove('notecard'); notesHost.innerHTML='<p class="empty">Engar athugasemdir enn.</p>'; }

  renderContacts(node);

  if(isEdit()){
    $('#heroPhoto').onclick = async ()=>{ const url=await pickAndUpload(); if(url){ node.photo=url; saveData(); rerender(); } };
    $('#renameNode').onclick = ()=>{ const nm=prompt('Nýtt nafn:', node.name); if(nm && nm.trim()){ node.name=nm.trim(); saveData(); rerender(); } };
    $('#deleteNode').onclick = ()=>{
      const inni = (node.children && node.children.length)
        ? `\n\nAthugið: allt sem er inni í þessu eyðist líka (${node.children.length} ${node.children.length===1?'hlutur':'hlutir'}).`
        : '';
      if(!confirm(`Eyða „${node.name}“?${inni}\n\nÞetta er ekki hægt að taka til baka.`)) return;
      const idx = r.parentArr.indexOf(node);
      if(idx > -1) r.parentArr.splice(idx, 1);
      saveData();
      if(path.length > 1) go('#/n/' + path.slice(0, -1).join('/'));  // upp um eitt stig
      else go('#/');                                                  // efsta stig -> forsíða
      toast('Eytt');
    };
    $('#addChild').onclick = ()=>addChildTo(node.children, rerender);
    $('#addContact').onclick = ()=>{ node.contacts.push({id:uid(),name:'',phone:'',note:''}); saveData(); rerender(); };
  }
}

function renderContacts(node){
  const wrap = $('#contacts');
  node.contacts = node.contacts || [];
  if(!node.contacts.length && !isEdit()){ wrap.innerHTML='<p class="empty">Engir tengiliðir skráðir enn.</p>'; return; }
  wrap.innerHTML='';
  node.contacts.forEach(c=>{
    const el=document.createElement('div'); el.className='row';
    el.innerHTML=`<div class="cName"></div><div class="cMeta"></div>
      ${isEdit()?`<div class="editrow"><button class="delbtn" data-act="del">✕ Eyða</button></div>`:''}`;
    mountEditableText($('.cName',el), c.name, 'Nafn tengiliðar', (v)=>{c.name=v;saveData();}, {strong:true});
    if(isEdit()){
      const meta = $('.cMeta',el); meta.innerHTML='';
      meta.appendChild(fieldLine('Símanúmer', c.phone, 'T.d. 555 1234', (v)=>{c.phone=v;saveData();}));
      meta.appendChild(fieldLine('Hvað gerir tengiliðurinn?', c.note, 'T.d. sér um viðgerðir á pressunni', (v)=>{c.note=v;saveData();}));
    } else {
      let html='';
      if(c.phone) html += `<div class="meta">📞 <a href="tel:${esc((c.phone||'').replace(/\s+/g,''))}">${esc(c.phone)}</a></div>`;
      if(c.note) html += `<div class="meta">${esc(c.note)}</div>`;
      $('.cMeta',el).innerHTML = html || '<span class="meta">Engar upplýsingar enn.</span>';
    }
    if(isEdit()) $('[data-act="del"]',el).onclick=()=>{ if(confirm('Eyða tengilið?')){ node.contacts=node.contacts.filter(x=>x!==c); saveData(); renderContacts(node);} };
    wrap.appendChild(el);
  });
}

function fieldLine(label, value, ph, onSave){
  const d=document.createElement('div');
  d.innerHTML=`<div class="fieldlabel">${label}</div>`;
  const holder=document.createElement('div'); d.appendChild(holder);
  mountEditableText(holder, value, ph, onSave, {single:true});
  return d;
}

/* ============================================================
   Leit
   ============================================================ */
function renderSearch(){
  app.innerHTML = `
    <div class="page-head"><h1>Leita</h1><p>Skrifaðu nafn á vél eða hlut.</p></div>
    <input class="searchinput" id="searchInput" placeholder="T.d. pressa, tætari, belti…" autocomplete="off">
    <div id="searchResults"></div>`;
  const inp = $('#searchInput'); inp.focus();
  const all = flatten();  // öll stig trésins, sama hversu djúpt
  // allur texti hnútsins settur saman (nafn, lýsing, athugasemdir, tengiliðir)
  const nodeText = (n)=>{
    let s = `${n.name||''} ${n.summary||''} ${n.notes||''}`;
    (n.contacts||[]).forEach(c=>{ s += ` ${c.name||''} ${c.note||''} ${c.phone||''}`; });
    return s.toLowerCase();
  };
  function run(){
    const q = inp.value.trim().toLowerCase();
    const out = $('#searchResults');
    if(!q){ out.innerHTML = '<p class="empty">Byrjaðu að skrifa…</p>'; return; }
    const terms = q.split(/\s+/).filter(Boolean);
    const res = all.filter(x => { const t = nodeText(x.node); return terms.every(w => t.includes(w)); });
    if(!res.length){ out.innerHTML = '<p class="empty">Ekkert fannst.</p>'; return; }
    out.innerHTML = res.map(x => `
      <a class="result" href="#/n/${x.path.join('/')}">
        <div class="result__name">${esc(x.node.name)}</div>
        <div class="result__path">${x.crumbs || 'Forsíða'}</div>
      </a>`).join('');
  }
  inp.addEventListener('input', run);
  run();
}

/* ============================================================
   Breytanlegur texti (smella → textreitur → vista)
   ============================================================ */
function mountEditableText(host, value, placeholder, onSave, opts={}){
  host.innerHTML='';
  const show = document.createElement('div');
  const fill = () => {
    if(value && value.trim()){
      show.innerHTML = opts.label
        ? `<span class="label">${esc(value)}</span>`
        : opts.strong ? `<div class="row__q">${nl2br(value)}</div>`
        : linkify(value);
    } else {
      show.innerHTML = isEdit() ? `<span style="color:#b6b1a4">${esc(placeholder)}</span>` : '';
    }
  };
  fill();
  host.appendChild(show);
  if(!isEdit()) return;

  show.classList.add('editmark');
  show.style.cursor='text';
  show.onclick = () => {
    const editor = document.createElement('div');
    const input = document.createElement(opts.single ? 'input' : 'textarea');
    input.className='edit'; input.value = value || '';
    if(opts.single) input.type='text';
    input.placeholder = placeholder;
    const bar = document.createElement('div'); bar.className='editrow';
    const save=document.createElement('button'); save.className='editbtn'; save.textContent='✓ Vista';
    const cancel=document.createElement('button'); cancel.className='editbtn'; cancel.textContent='Hætta við';
    bar.append(save,cancel);
    editor.append(input,bar);
    host.replaceChild(editor, show);
    input.focus();
    save.onclick = () => { value = input.value; onSave(value); fill(); host.replaceChild(show, editor); toast('Vistað ✓'); };
    cancel.onclick = () => { host.replaceChild(show, editor); };
  };
}

/* ============================================================
   Ræsing
   ============================================================ */
$('#backBtn').onclick = () => {
  const p = parseHash();
  if(p[0]==='n' && p.length>2) go('#/n/' + p.slice(1,-1).join('/'));  // upp um eitt stig
  else go('#/');                                                       // annað -> forsíða
};
$('#lockBtn').onclick = () => { if(confirm('Læsa handbókinni?')) lock(); };
$('#searchBtn').onclick = () => go('#/leit');

window.addEventListener('hashchange', render);

// Þegar appið kemur aftur í forgrunn: sækja nýjustu gögn (sér breytingar frá hinum)
document.addEventListener('visibilitychange', async ()=>{
  if(document.visibilityState==='visible' && MODE!=='locked' && UNLOCK_CODE && db){
    try{
      const res = await fetchHandbook(UNLOCK_CODE);
      if(res){
        DATA = normalize(res.data); cacheData();
        if(!document.querySelector('textarea.edit, input.edit')) render(); // ekki trufla ef verið er að skrifa
      }
    }catch(e){}
  }
});

// Ræsing: ef búið var að opna áður, sýna afrit strax og sækja svo nýtt
async function init(){
  let unlock = null;
  try{ unlock = JSON.parse(localStorage.getItem(UNLOCK_KEY) || 'null'); }catch(e){}
  const cached = loadCache();
  if(!unlock){ renderLock(); return; }

  MODE = unlock.role; UNLOCK_CODE = unlock.code;
  if(cached){ DATA = normalize(cached); render(); }   // strax úr afriti (líka ónettengt)

  if(db){
    try{
      const res = await fetchHandbook(unlock.code);
      if(res){ MODE = res.role; DATA = normalize(res.data); cacheData(); render(); return; }
      else { lock(); return; }                         // kóða breytt -> læsa
    }catch(e){ if(!cached){ renderLock(); } }           // ónettengt og ekkert afrit
  } else if(!cached){
    renderLock();
  }
}
init();

if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  navigator.serviceWorker.register('service-worker.js').catch(()=>{});
}
