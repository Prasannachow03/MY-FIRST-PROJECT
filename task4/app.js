// app.js - interactive logic for capstone portfolio
// Uses localStorage to persist projects and contact drafts

const STORAGE_KEY = 'capstone_projects_v1'
const CONTACT_DRAFT = 'capstone_contact_draft'

// DOM elements
const projectsGrid = document.getElementById('projects-grid')
const addBtn = document.getElementById('add-project-btn')
const modal = document.getElementById('modal')
const closeModalBtn = document.getElementById('close-modal')
const projectForm = document.getElementById('project-form')
const projectIdInput = document.getElementById('project-id')
const titleInput = document.getElementById('project-title')
const descInput = document.getElementById('project-desc')
const techInput = document.getElementById('project-tech')
const urlInput = document.getElementById('project-url')
const deleteProjectBtn = document.getElementById('delete-project')
const searchInput = document.getElementById('search-input')
const techFilter = document.getElementById('tech-filter')
const noProjects = document.getElementById('no-projects')
const yearSpan = document.getElementById('year')
const themeToggle = document.getElementById('theme-toggle')

// Contact
const contactForm = document.getElementById('contact-form')
const contactFeedback = document.getElementById('contact-feedback')
const saveDraftBtn = document.getElementById('save-draft')

// init
yearSpan.textContent = new Date().getFullYear()
let projects = loadProjects()

// Example seed if empty
if (!projects.length) {
  projects = [
    {
      id: cryptoRandomId(),
      title: "Portfolio Website",
      description: "A multi-page portfolio featuring projects and contact form.",
      tech: ["HTML","CSS","JavaScript"],
      url: "https://github.com/your-repo/portfolio"
    },
    {
      id: cryptoRandomId(),
      title: "Weather App",
      description: "Small API-driven app showing local weather and forecasts.",
      tech: ["JavaScript","API","CSS"],
      url: ""
    }
  ]
  saveProjects()
}

renderProjects()

// Event listeners
addBtn.addEventListener('click', () => openModal())
closeModalBtn.addEventListener('click', closeModal)
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal() })
projectForm.addEventListener('submit', onProjectSave)
deleteProjectBtn.addEventListener('click', onProjectDelete)
searchInput.addEventListener('input', renderProjects)
techFilter.addEventListener('change', renderProjects)
themeToggle.addEventListener('click', toggleTheme)

// Contact handlers
contactForm.addEventListener('submit', onContactSubmit)
saveDraftBtn.addEventListener('click', saveContactDraft)
loadContactDraft()

/* ---------- Functions ---------- */

function cryptoRandomId() {
  // simple unique id
  return 'p_' + Math.random().toString(36).slice(2, 9)
}

function loadProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch (e) {
    console.error("Failed to load projects:", e)
    return []
  }
}

function saveProjects() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
}

function renderProjects() {
  const q = searchInput.value.trim().toLowerCase()
  const tech = techFilter.value
  projectsGrid.innerHTML = ''

  const filtered = projects.filter(p => {
    const matchesQ = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || (p.tech || []).join(' ').toLowerCase().includes(q)
    const matchesTech = !tech || (p.tech || []).includes(tech)
    return matchesQ && matchesTech
  })

  if (!filtered.length) {
    noProjects.style.display = 'block'
  } else {
    noProjects.style.display = 'none'
    filtered.forEach(p => projectsGrid.appendChild(makeCard(p)))
  }
}

function makeCard(p) {
  const card = document.createElement('article')
  card.className = 'card'
  const h = document.createElement('h4')
  h.textContent = p.title
  const desc = document.createElement('p')
  desc.textContent = p.description
  const meta = document.createElement('div')
  meta.className = 'meta'
  meta.textContent = p.url ? 'Live / Repo available' : 'Local / Demo'
  const chips = document.createElement('div')
  chips.className = 'chips'
  (p.tech || []).forEach(t => {
    const c = document.createElement('span')
    c.className = 'chip'
    c.textContent = t
    chips.appendChild(c)
  })
  const actions = document.createElement('div')
  actions.className = 'project-actions'
  const viewBtn = document.createElement('button')
  viewBtn.className = 'btn'
  viewBtn.textContent = 'View'
  viewBtn.addEventListener('click', () => viewProject(p))
  const editBtn = document.createElement('button')
  editBtn.className = 'btn'
  editBtn.textContent = 'Edit'
  editBtn.addEventListener('click', () => openModal(p))
  actions.appendChild(viewBtn)
  actions.appendChild(editBtn)

  card.appendChild(h)
  card.appendChild(chips)
  card.appendChild(desc)
  card.appendChild(meta)
  card.appendChild(actions)

  return card
}

function viewProject(p) {
  // small detail modal showing more info, for now reuse editor in read-only mode
  openModal(p, { readonly: true })
}

function openModal(project = null, { readonly = false } = {}) {
  modal.setAttribute('aria-hidden', 'false')
  if (project) {
    projectIdInput.value = project.id
    titleInput.value = project.title
    descInput.value = project.description
    techInput.value = (project.tech || []).join(',')
    urlInput.value = project.url || ''
    deleteProjectBtn.style.display = readonly ? 'none' : 'inline-block'
    document.getElementById('modal-title').textContent = readonly ? 'Project Details' : 'Edit Project'
    // disable inputs if readonly
    [titleInput, descInput, techInput, urlInput].forEach(i => i.disabled = readonly)
    projectForm.querySelector('button[type="submit"]').style.display = readonly ? 'none' : 'inline-block'
  } else {
    projectIdInput.value = ''
    projectForm.reset()
    deleteProjectBtn.style.display = 'none'
    [titleInput, descInput, techInput, urlInput].forEach(i => i.disabled = false)
    document.getElementById('modal-title').textContent = 'Add Project'
    projectForm.querySelector('button[type="submit"]').style.display = 'inline-block'
  }
}

function closeModal() {
  modal.setAttribute('aria-hidden', 'true')
  projectForm.reset()
  projectIdInput.value = ''
}

function onProjectSave(e) {
  e.preventDefault()
  const id = projectIdInput.value || cryptoRandomId()
  const title = titleInput.value.trim()
  const description = descInput.value.trim()
  const tech = (techInput.value || '').split(',').map(t => t.trim()).filter(Boolean)
  const url = urlInput.value.trim()

  if (!title || !description) {
    alert('Please add title and description.')
    return
  }

  const existingIndex = projects.findIndex(p => p.id === id)
  const record = { id, title, description, tech, url }

  if (existingIndex >= 0) {
    projects[existingIndex] = record
  } else {
    projects.unshift(record) // newest on top
  }

  saveProjects()
  renderProjects()
  closeModal()
}

function onProjectDelete() {
  const id = projectIdInput.value
  if (!id) return
  if (!confirm('Delete this project?')) return
  projects = projects.filter(p => p.id !== id)
  saveProjects()
  renderProjects()
  closeModal()
}

/* Theme toggle (very small) */
function toggleTheme() {
  const root = document.documentElement
  if (root.style.backgroundColor) {
    root.style.backgroundColor = ''
    root.style.color = ''
    themeToggle.textContent = '🌙'
  } else {
    root.style.backgroundColor = '#0b1225'
    root.style.color = '#e6eef8'
    themeToggle.textContent = '☀️'
  }
}

/* ---------- Contact form ---------- */
function onContactSubmit(e) {
  e.preventDefault()
  const name = contactForm.name.value.trim()
  const email = contactForm.email.value.trim()
  const message = contactForm.message.value.trim()

  if (!name || !email || !message) {
    contactFeedback.style.display = 'block'
    contactFeedback.textContent = 'Please complete all fields.'
    setTimeout(() => contactFeedback.style.display = 'none', 3000)
    return
  }

  // For demo: store message in localStorage and open mailto
  const sent = { id: cryptoRandomId(), name, email, message, at: new Date().toISOString() }
  const key = 'capstone_messages_v1'
  const arr = JSON.parse(localStorage.getItem(key) || '[]')
  arr.unshift(sent)
  localStorage.setItem(key, JSON.stringify(arr))

  contactFeedback.style.display = 'block'
  contactFeedback.textContent = 'Message saved locally. Opening email client...'
  setTimeout(() => contactFeedback.style.display = 'none', 2500)

  // open mail client with prefilled subject & body (not required for submission, but handy)
  const subject = encodeURIComponent(`Contact from ${name} — Capstone`)
  const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
  window.location.href = `mailto:${encodeURIComponent('your.email@example.com')}?subject=${subject}&body=${body}`

  contactForm.reset()
  localStorage.removeItem(CONTACT_DRAFT)
}

function saveContactDraft() {
  const draft = {
    name: contactForm.name.value,
    email: contactForm.email.value,
    message: contactForm.message.value,
    savedAt: new Date().toISOString()
  }
  localStorage.setItem(CONTACT_DRAFT, JSON.stringify(draft))
  contactFeedback.style.display = 'block'
  contactFeedback.textContent = 'Draft saved locally.'
  setTimeout(() => contactFeedback.style.display = 'none', 2000)
}

function loadContactDraft() {
  try {
    const raw = localStorage.getItem(CONTACT_DRAFT)
    if (!raw) return
    const d = JSON.parse(raw)
    contactForm.name.value = d.name || ''
    contactForm.email.value = d.email || ''
    contactForm.message.value = d.message || ''
    contactFeedback.style.display = 'block'
    contactFeedback.textContent = 'Loaded saved draft.'
    setTimeout(() => contactFeedback.style.display = 'none', 2000)
  } catch (e) {
    console.error('Failed to load draft', e)
  }
}
