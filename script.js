/* CV Craft Pro - Vanilla JavaScript only */
const $ = (id) => document.getElementById(id);
const storageKey = 'cvCraftProData';
let activeTemplate = 'simple';
let zoom = 1;
let photoData = '';

const lists = {
  education: $('educationList'),
  experience: $('experienceList'),
  project: $('projectList')
};

const suggestions = {
  summary: 'Motivated beginner frontend developer with a strong interest in building clean, responsive, and user-friendly web applications. Skilled in HTML, CSS, and JavaScript, with hands-on practice creating real projects and learning modern UI/UX principles.',
  technicalSkills: 'HTML, CSS, JavaScript, Responsive Design, Git, GitHub, UI Design, Debugging, LocalStorage, DOM Manipulation',
  responsibilities: 'Built responsive user interfaces using HTML, CSS, and JavaScript. Improved page structure, fixed layout issues, and collaborated with team members to deliver clean and maintainable features.',
  projectDescription: 'A practical web application designed to solve a real user problem with a clean interface, responsive layout, and smooth user experience. The project helped improve frontend development, DOM manipulation, and UI design skills.'
};

function esc(value = '') {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function linkify(value) {
  if (!value) return '';
  const safe = esc(value);
  const href = value.startsWith('http') ? value : `https://${value}`;
  return `<a href="${esc(href)}" target="_blank">${safe}</a>`;
}

function splitItems(value = '') {
  return value.split(',').map(item => item.trim()).filter(Boolean);
}

function lines(value = '') {
  return value.split('\n').map(item => item.trim()).filter(Boolean);
}

function field(id) {
  return $(id)?.value.trim() || '';
}

function createEntry(type, data = {}) {
  const card = document.createElement('div');
  card.className = 'entry-card';
  card.dataset.type = type;

  const templates = {
    education: `
      <button class="remove-btn" type="button">×</button>
      <label>Degree</label><input class="field" data-field="degree" value="${esc(data.degree || '')}" placeholder="BSc Computer Science">
      <label>Institution</label><input class="field" data-field="institution" value="${esc(data.institution || '')}" placeholder="Tribhuvan University">
      <label>Location</label><input class="field" data-field="location" value="${esc(data.location || '')}" placeholder="Kathmandu, Nepal">
      <label>Start Year</label><input class="field" data-field="start" value="${esc(data.start || '')}" placeholder="2022">
      <label>End Year</label><input class="field" data-field="end" value="${esc(data.end || '')}" placeholder="2026">
      <label>GPA</label><input class="field" data-field="gpa" value="${esc(data.gpa || '')}" placeholder="3.6 / 4.0">
      <label>Description</label><textarea class="field textarea" data-field="description" placeholder="Relevant coursework, achievements...">${esc(data.description || '')}</textarea>
    `,
    experience: `
      <button class="remove-btn" type="button">×</button>
      <label>Job Title</label><input class="field" data-field="title" value="${esc(data.title || '')}" placeholder="Junior Frontend Developer">
      <label>Company Name</label><input class="field" data-field="company" value="${esc(data.company || '')}" placeholder="ABC Software">
      <label>Company Website</label><input class="field" data-field="website" value="${esc(data.website || '')}" placeholder="https://company.com">
      <label>Location</label><input class="field" data-field="location" value="${esc(data.location || '')}" placeholder="Remote / Kathmandu">
      <label>Start Date</label><input class="field" data-field="start" value="${esc(data.start || '')}" placeholder="Jan 2025">
      <label>End Date</label><input class="field" data-field="end" value="${esc(data.end || '')}" placeholder="Present">
      <label class="check-row"><input type="checkbox" data-field="current" ${data.current ? 'checked' : ''}> Currently working</label>
      <div class="label-row"><label>Responsibilities</label><button class="suggest-btn inner-suggest" type="button" data-fill="responsibilities">Suggest</button></div>
      <textarea class="field textarea" data-field="responsibilities" placeholder="Main work responsibilities...">${esc(data.responsibilities || '')}</textarea>
      <label>Achievements</label><textarea class="field textarea" data-field="achievements" placeholder="Improved performance, completed features...">${esc(data.achievements || '')}</textarea>
      <label>Technologies Used</label><input class="field" data-field="tech" value="${esc(data.tech || '')}" placeholder="HTML, CSS, JavaScript">
    `,
    project: `
      <button class="remove-btn" type="button">×</button>
      <label>Project Name</label><input class="field" data-field="name" value="${esc(data.name || '')}" placeholder="CV Generator">
      <label>Category</label><input class="field" data-field="category" value="${esc(data.category || '')}" placeholder="Frontend Web App">
      <div class="label-row"><label>Description</label><button class="suggest-btn inner-suggest" type="button" data-fill="projectDescription">Suggest</button></div>
      <textarea class="field textarea" data-field="description" placeholder="Project details...">${esc(data.description || '')}</textarea>
      <label>Technologies Used</label><input class="field" data-field="tech" value="${esc(data.tech || '')}" placeholder="HTML, CSS, JavaScript">
      <label>GitHub Link</label><input class="field" data-field="github" value="${esc(data.github || '')}" placeholder="https://github.com/user/project">
      <label>Live Demo Link</label><input class="field" data-field="demo" value="${esc(data.demo || '')}" placeholder="https://demo.com">
      <label class="check-row"><input type="checkbox" data-field="featured" ${data.featured ? 'checked' : ''}> Featured project</label>
    `
  };

  card.innerHTML = templates[type];
  card.querySelector('.remove-btn').addEventListener('click', () => {
    card.remove();
    update();
  });
  card.addEventListener('input', update);
  card.addEventListener('change', update);
  card.querySelectorAll('.inner-suggest').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.fill;
      const area = btn.closest('.entry-card').querySelector(key === 'responsibilities' ? '[data-field="responsibilities"]' : '[data-field="description"]');
      area.value = suggestions[key];
      update();
    });
  });
  lists[type].appendChild(card);
}

function collectEntries(type) {
  return [...lists[type].querySelectorAll('.entry-card')].map(card => {
    const item = {};
    card.querySelectorAll('[data-field]').forEach(el => {
      item[el.dataset.field] = el.type === 'checkbox' ? el.checked : el.value.trim();
    });
    return item;
  });
}

function getData() {
  return {
    activeTemplate,
    photoData,
    personal: {
      fullName: field('fullName'), jobTitle: field('jobTitle'), headline: field('headline'), email: field('email'), phone: field('phone'), address: field('address'), website: field('website'), portfolio: field('portfolio'), linkedin: field('linkedin'), github: field('github'), summary: field('summary')
    },
    skills: { technicalSkills: field('technicalSkills'), softSkills: field('softSkills'), languages: field('languages') },
    extras: { certifications: field('certifications'), awards: field('awards'), volunteer: field('volunteer'), references: field('references'), interests: field('interests') },
    education: collectEntries('education'),
    experience: collectEntries('experience'),
    project: collectEntries('project')
  };
}

function saveData() {
  localStorage.setItem(storageKey, JSON.stringify(getData()));
  $('saveStatus').textContent = 'Saved';
}

function loadData() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return false;
  const data = JSON.parse(saved);
  activeTemplate = data.activeTemplate || 'simple';
  photoData = data.photoData || '';
  Object.entries(data.personal || {}).forEach(([k, v]) => { if ($(k)) $(k).value = v || ''; });
  Object.entries(data.skills || {}).forEach(([k, v]) => { if ($(k)) $(k).value = v || ''; });
  Object.entries(data.extras || {}).forEach(([k, v]) => { if ($(k)) $(k).value = v || ''; });
  Object.values(lists).forEach(list => list.innerHTML = '');
  (data.education || []).forEach(item => createEntry('education', item));
  (data.experience || []).forEach(item => createEntry('experience', item));
  (data.project || []).forEach(item => createEntry('project', item));
  setActiveTemplateButton();
  renderResume();
  return true;
}

function setActiveTemplateButton() {
  document.querySelectorAll('.template-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.template === activeTemplate));
}

function section(title, content) {
  return content ? `<section class="resume-section"><h3>${title}</h3>${content}</section>` : '';
}

function chipList(value) {
  const items = splitItems(value);
  return items.length ? `<div class="chips">${items.map(item => `<span class="chip">${esc(item)}</span>`).join('')}</div>` : '';
}

function simpleLines(value) {
  const items = lines(value);
  return items.length ? items.map(item => `<div class="entry-text">${esc(item)}</div>`).join('') : '';
}

function renderResume() {
  const data = getData();
  const p = data.personal;
  const contact = [p.email, p.phone, p.address, p.website, p.portfolio, p.linkedin, p.github].filter(Boolean).map(esc).join('<span>•</span>');

  const educationHTML = data.education.map(e => `
    <div class="resume-entry">
      <div class="entry-top"><div class="entry-name">${esc(e.degree || 'Degree')}</div><div class="entry-meta">${esc([e.start, e.end].filter(Boolean).join(' - '))}</div></div>
      <div class="entry-sub">${esc([e.institution, e.location].filter(Boolean).join(' • '))}</div>
      ${e.gpa ? `<div class="entry-text"><strong>GPA:</strong> ${esc(e.gpa)}</div>` : ''}
      ${e.description ? `<div class="entry-text">${esc(e.description)}</div>` : ''}
    </div>`).join('');

  const experienceHTML = data.experience.map(e => `
    <div class="resume-entry">
      <div class="entry-top"><div class="entry-name">${esc(e.title || 'Job Title')}</div><div class="entry-meta">${esc(e.start || '')} - ${esc(e.current ? 'Present' : e.end || '')}</div></div>
      <div class="entry-sub">${esc([e.company, e.location].filter(Boolean).join(' • '))} ${e.website ? `• ${linkify(e.website)}` : ''}</div>
      ${e.responsibilities ? `<div class="entry-text"><strong>Responsibilities:</strong>\n${esc(e.responsibilities)}</div>` : ''}
      ${e.achievements ? `<div class="entry-text"><strong>Achievements:</strong>\n${esc(e.achievements)}</div>` : ''}
      ${e.tech ? chipList(e.tech) : ''}
    </div>`).join('');

  const projectHTML = data.project.map(pr => `
    <div class="resume-entry">
      <div class="entry-top"><div class="entry-name">${pr.featured ? '★ ' : ''}${esc(pr.name || 'Project Name')}</div><div class="entry-meta">${esc(pr.category || '')}</div></div>
      ${pr.description ? `<div class="entry-text">${esc(pr.description)}</div>` : ''}
      ${pr.tech ? chipList(pr.tech) : ''}
      <div class="links">${pr.github ? linkify(pr.github) : ''}${pr.demo ? linkify(pr.demo) : ''}</div>
    </div>`).join('');

  const skillsHTML = [
    data.skills.technicalSkills ? `<div class="resume-entry"><div class="entry-name">Technical Skills</div>${chipList(data.skills.technicalSkills)}</div>` : '',
    data.skills.softSkills ? `<div class="resume-entry"><div class="entry-name">Soft Skills</div>${chipList(data.skills.softSkills)}</div>` : '',
    data.skills.languages ? `<div class="resume-entry"><div class="entry-name">Languages</div>${chipList(data.skills.languages)}</div>` : ''
  ].join('');

  const extrasHTML = [
    section('Certifications', simpleLines(data.extras.certifications)),
    section('Awards', simpleLines(data.extras.awards)),
    section('Volunteer Experience', simpleLines(data.extras.volunteer)),
    section('References', simpleLines(data.extras.references)),
    section('Interests', chipList(data.extras.interests))
  ].join('');

  const header = `
    <header class="resume-header">
      ${photoData ? `<img class="resume-photo" src="${photoData}" alt="Profile photo">` : ''}
      <div>
        <div class="resume-name">${esc(p.fullName || 'Your Name')}</div>
        <div class="resume-title">${esc(p.jobTitle || 'Your Job Title')}</div>
        <div class="resume-headline">${esc(p.headline || 'Professional headline goes here')}</div>
        <div class="contact-line">${contact}</div>
      </div>
    </header>`;

  const mainSections = `
    ${section('Professional Summary', p.summary ? `<p class="entry-text">${esc(p.summary)}</p>` : '')}
    ${section('Experience', experienceHTML)}
    ${section('Projects', projectHTML)}
    ${section('Education', educationHTML)}
    ${section('Skills', skillsHTML)}
    ${extrasHTML}`;

  let html = `${header}<main class="resume-body">${mainSections}</main>`;
  if (['sidebar','two-column'].includes(activeTemplate)) {
    html = `<div class="resume-layout">${header}<main class="resume-body">${mainSections}</main></div>`;
  }

  const preview = $('resumePreview');
  preview.className = `resume-paper template-${activeTemplate} ${photoData ? 'show-photo' : ''}`;
  preview.innerHTML = html;
}

function update() {
  $('saveStatus').textContent = 'Saving...';
  renderResume();
  clearTimeout(window.saveTimer);
  window.saveTimer = setTimeout(saveData, 250);
}

function resetAll() {
  if (!confirm('Reset all resume data?')) return;
  localStorage.removeItem(storageKey);
  document.querySelectorAll('.save-input').forEach(input => input.value = '');
  Object.values(lists).forEach(list => list.innerHTML = '');
  photoData = '';
  activeTemplate = 'simple';
  setActiveTemplateButton();
  addStarterEntries();
  update();
}

function addStarterEntries() {
  if (!lists.education.children.length) createEntry('education');
  if (!lists.experience.children.length) createEntry('experience');
  if (!lists.project.children.length) createEntry('project');
}

document.querySelectorAll('.save-input').forEach(input => input.addEventListener('input', update));
document.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', () => { createEntry(btn.dataset.add); update(); }));
document.querySelectorAll('.template-btn').forEach(btn => btn.addEventListener('click', () => { activeTemplate = btn.dataset.template; setActiveTemplateButton(); update(); }));
document.querySelectorAll('.suggest-btn[data-suggest]').forEach(btn => btn.addEventListener('click', () => { $(btn.dataset.suggest).value = suggestions[btn.dataset.suggest]; update(); }));

$('photoInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => { photoData = reader.result; update(); };
  reader.readAsDataURL(file);
});

$('downloadBtn').addEventListener('click', () => window.print());
$('loadBtn').addEventListener('click', () => { if (!loadData()) alert('No saved data found yet.'); });
$('resetBtn').addEventListener('click', resetAll);
$('zoomIn').addEventListener('click', () => { zoom = Math.min(1.4, zoom + .1); applyZoom(); });
$('zoomOut').addEventListener('click', () => { zoom = Math.max(.5, zoom - .1); applyZoom(); });

function applyZoom() {
  $('paperWrap').style.transform = `scale(${zoom})`;
  $('paperWrap').style.marginBottom = `${(1123 * zoom) - 1123}px`;
  $('zoomText').textContent = `${Math.round(zoom * 100)}%`;
}

if (!loadData()) {
  $('fullName').value = 'Kreel Dhakal';
  $('jobTitle').value = 'Frontend Developer';
  $('headline').value = 'Beginner developer building clean websites and useful digital tools';
  $('summary').value = suggestions.summary;
  $('technicalSkills').value = 'HTML, CSS, JavaScript, Responsive Design, GitHub';
  $('softSkills').value = 'Communication, Teamwork, Problem Solving, Time Management';
  $('languages').value = 'Nepali, English, Hindi';
  $('interests').value = 'Coding, Minecraft Servers, UI Design, Technology';
  addStarterEntries();
  update();
}
applyZoom();
