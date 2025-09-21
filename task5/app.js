// app.js (deferred) - Task-5: optimized JS
// - Minimal DOM writes
// - Debounced search
// - Lazy-loading thumbnails via <img loading="lazy"> + IntersectionObserver for lower-tier heavy content
// - Small service-worker registration for caching (optional)

/* ====== CONFIG & SMALL DATASET ====== */
const PROJECTS_KEY = 'tp5_projects_v1'
const CONTACT_DRAFT = 'tp5_contact_draft'
const projectsGrid = document.getElementById('projects-grid')
const qInput = document.getElementById('q')
const yearSpan = document.getElementById('year')
const contactInfo = document.getElementById('contact-info')
const contactForm = document.getElementById('contact-form')
const saveDraftBtn = document.getElementById('save-draft')

yearSpan.textContent = new Date().getFullYear()

// Small demo dataset (kept tiny to reduce initial rendering cost)
const seedProjects = [
  { id:'p1', title:'Optimized Portfolio', desc:'Performance first portfolio with lazy images and caching.', img: 'https://via.placeholder.com/640x360?text=Project+1' },
  { id:'p2', title:'Tiny E-Store', desc:'Product list with responsive images and fast filtering.', img: 'https://via.placeholder.com/640x360?text=Project+2' },
  { id:'p3', title:'Image Gallery', desc:'Uses IntersectionObserver and progressive loading.', img: 'https://via.placeholder.com/640x360?text=Project+3' },
]

// LocalStorage helper (fast, minimal)
function loadProjects(){
  try{
    const raw = localStorage.getItem(PROJECTS_KEY)
    return raw ? JSON.parse(raw) : seedProjects.slice()
  }catch(e){
    console.warn('loadProjects failed', e)
    return seedProjects.slice()
  }
}
function saveProjects(list){
  try{ localStorage.setItem(PROJECTS_KEY, JSON.stringify(list)) }catch(e){/* ignore */ }
}

/* ====== RENDERING: minimal DOM updates ====== */

// Build a single document fragment to reduce reflows
function renderProjects(list){
  projectsGrid.innerHTML = '' // tiny dataset -> clearing is fine and simple
  const frag = document.createDocumentFragment()
  list.forEach(p => {
    const card = document.createElement('article')
    card.className = 'card'
    // efficient innerHTML chunk (small, safe content)
    card.innerHTML = `
      <img class="thumb" alt="${escapeHtml(p.title)}" loading="lazy"
        src="${p.img}"
        srcset="${p.img.replace('640x360','480x270')} 480w, ${p.img.replace('640x360','800x450')} 800w"
        sizes="(max-width:600px) 100vw, 280px">
      <div><h3>${escapeHtml(p.title)}</h3><p class="meta">${escapeHtml(p.desc)}</p></div>
    `
    frag.appendChild(card)
  })
  projectsGrid.appendChild(frag)
  // Observe the projects grid for lazy-loading heavy placeholder content
}

/* ====== SEARCH: debounced, low-overhead ====== */
function debounce(fn, wait=200){
  let t
  return (...args) => { clearTimeout(t); t = setTimeout(()=>fn(...args), wait) }
}

const projects = loadProjects()
renderProjects(projects)

qInput && qInput.addEventListener('input', debounce((e)=>{
  const q = e.target.value.trim().toLowerCase()
  if(!q) return renderProjects(projects)
  const filtered = projects.filter(p => (p.title + ' ' + p.desc).toLowerCase().includes(q))
  renderProjects(filtered)
}, 180))

/* ====== Contact: simple UI feedback + draft save ====== */
contactForm && contactForm.addEventListener('submit', (ev) => {
  ev.preventDefault()
  const data = new FormData(contactForm)
  const name = data.get('name').trim()
  const email = data.get('email').trim()
  const message = data.get('message').trim()
  if(!name||!email||!message){ contactInfo.textContent = 'Complete all fields.'; setTimeout(()=>contactInfo.textContent='',2500); return }
  // store locally as demo
  const out = { id: 'm_'+Date.now(), name, email, message, at: new Date().toISOString() }
  const arr = JSON.parse(localStorage.getItem('tp5_messages_v1')||'[]')
  arr.unshift(out)
  localStorage.setItem('tp5_messages_v1', JSON.stringify(arr))
  contactInfo.textContent = 'Saved locally. (Demo only)'
  contactForm.reset()
  setTimeout(()=>contactInfo.textContent='',2000)
})

saveDraftBtn && saveDraftBtn.addEventListener('click', ()=> {
  const data = new FormData(contactForm)
  const draft = { name: data.get('name')||'', email: data.get('email')||'', message: data.get('message')||'', savedAt: new Date().toISOString() }
  localStorage.setItem(CONTACT_DRAFT, JSON.stringify(draft))
  contactInfo.textContent = 'Draft saved.'
  setTimeout(()=>contactInfo.textContent='',1600)
})

// Try to load draft on init
try{
  const d = JSON.parse(localStorage.getItem(CONTACT_DRAFT)||'null')
  if(d){
    contactForm.name.value = d.name||''
    contactForm.email.value = d.email||''
    contactForm.message.value = d.message||''
    contactInfo.textContent = 'Loaded contact draft.'
    setTimeout(()=>contactInfo.textContent='',1200)
  }
}catch(e){ /* ignore */ }

/* ====== Lazy heavy content: IntersectionObserver triggers additional load ====== */
const heavyPlaceholder = document.getElementById('heavy-placeholder')
if('IntersectionObserver' in window && heavyPlaceholder){
  const io = new IntersectionObserver((entries, obs)=>{
    entries.forEach(en => {
      if(en.isIntersecting){
        // Simulate loading heavier content (e.g., additional project cards, analytics) only when needed
        loadMoreContent()
        obs.disconnect()
      }
    })
  }, {rootMargin:'200px'})
  io.observe(heavyPlaceholder)
} else {
  // fallback: load immediately
  loadMoreContent()
}

function loadMoreContent(){
  // Simulate appending 3 more cards after user scrolls near bottom (delayed to reduce initial cost)
  setTimeout(()=>{
    const more = [
      { id:'p4', title:'Accessibility Audit', desc:'Optimized for keyboard & screen reader.', img:'https://via.placeholder.com/640x360?text=Project+4' },
      { id:'p5', title:'Lazy Images Demo', desc:'Progressive image loading patterns.', img:'https://via.placeholder.com/640x360?text=Project+5' },
      { id:'p6', title:'SW Caching', desc:'Service-worker friendly caching demo.', img:'https://via.placeholder.com/640x360?text=Project+6' },
    ]
    projects.push(...more)
    saveProjects(projects)
    renderProjects(projects)
  }, 300) // small delay to avoid jank
}

/* ====== Optional: register a service worker to enable offline / caching -->
   For the internship demo, you can add a minimal sw.js file to your project root:
   // sw.js (example)
   self.addEventListener('install', e => {
     self.skipWaiting()
     e.waitUntil(caches.open('tp5-v1').then(c => c.addAll(['/','/index.html','/styles.css'])))
   })
   self.addEventListener('fetch', e => {
     e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)))
   })
   Then this script will register it:
*/
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    // register after load to avoid blocking critical resources
    navigator.serviceWorker.register('/sw.js').catch(()=>{/* sw optional for demo; ignore errors */})
  })
}

/* ====== SMALL HELPERS ====== */
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c])
}
