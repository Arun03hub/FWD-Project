const mainSection = document.getElementById('main-section');
const formSection = document.getElementById('form-section');
const progressSection = document.getElementById('progress-section');
const timetableSection = document.getElementById('timetable-section');

function showSection(sec) {
  [mainSection, formSection, progressSection, timetableSection].forEach(s => s.classList.remove('active'));
  sec.classList.add('active');
}
let navBtns = [
  [document.getElementById('nav-tasks'), mainSection],
  [document.getElementById('nav-add'), formSection],
  [document.getElementById('nav-progress'), progressSection],
  [document.getElementById('nav-timetable'), timetableSection],
  [document.getElementById('mobile-tasks'), mainSection],
  [document.getElementById('mobile-add'), formSection],
  [document.getElementById('mobile-progress'), progressSection],
  [document.getElementById('mobile-timetable'), timetableSection]
];
navBtns.forEach(([btn, section]) => {
  if (btn) btn.onclick = () => {
    showSection(section);
    if (section === mainSection) renderTasks();
    if (section === progressSection) renderProgress();
    if (section === timetableSection) renderTimetable();
    if (section === formSection) resetForm();
  };
});
document.getElementById('welcome-msg').onclick = () => {
  showSection(mainSection);
  renderTasks();
};

// Quote slider JS
const slidesContainer = document.getElementById('slides-container');
const slides = slidesContainer.children;
const prevArrow = document.querySelector('.prev-arrow');
const nextArrow = document.querySelector('.next-arrow');
let currentSlide = 0, totalSlides = slides.length, slideInterval;
function showSlide(index) {
  if (index < 0) index = totalSlides - 1;
  else if (index >= totalSlides) index = 0;
  currentSlide = index;
  slidesContainer.style.transform = `translateX(-${index * 100}%)`;
}
function nextSlide() { showSlide(currentSlide + 1); }
function prevSlide() { showSlide(currentSlide - 1); }
prevArrow.addEventListener('click', () => { prevSlide(); resetSlideInterval(); });
nextArrow.addEventListener('click', () => { nextSlide(); resetSlideInterval(); });
function resetSlideInterval() { clearInterval(slideInterval); slideInterval = setInterval(nextSlide, 3000); }

const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburgerMenu) hamburgerMenu.onclick = function(e) { e.stopPropagation(); mobileMenu.style.display = (mobileMenu.style.display === 'flex') ? 'none' : 'flex'; };
document.addEventListener('click', function(e) { if (mobileMenu.style.display === 'flex' && !mobileMenu.contains(e.target) && e.target !== hamburgerMenu) { mobileMenu.style.display = 'none'; } });

const taskForm = document.getElementById('task-form');
const timetableBody = document.querySelector('#timetable tbody');
const formTitle = document.getElementById('form-title');
const numTopicsInput = document.getElementById('numTopics');
const topicsContainer = document.getElementById('topics-container');
let tasks = JSON.parse(localStorage.getItem('studyTasks')) || [];
tasks.forEach(task => { if (!Array.isArray(task.topics)) task.topics = []; if (!Array.isArray(task.completedTopics)) task.completedTopics = []; });
function saveTasks() { localStorage.setItem('studyTasks', JSON.stringify(tasks)); }

function renderTasks() {
  const tasksList = document.getElementById('tasks-list-inside-main');
  tasksList.innerHTML = '';
  if (tasks.length === 0) { tasksList.innerHTML = '<p style="text-align:center;color:#636e72;margin-top:35px;font-size:1.19rem;">No study tasks added yet.</p>'; return; }
  tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  tasks.forEach((task, index) => {
    const card = document.createElement('div'); card.className = 'task-card';
    const info = document.createElement('div'); info.className = 'task-info';
    const statCorner = document.createElement('div'); statCorner.className = 'task-status-corner';
    const isCompleted = (task.topics.length ? (task.completedTopics.length === task.topics.length) : (task.completedTopics.length > 0));
    const iEl = document.createElement('span');
    iEl.className = 'main-status-icon ' + (isCompleted ? 'main-status-completed' : 'main-status-pending');
    iEl.innerHTML = isCompleted
      ? '<svg width="23" height="23" viewBox="0 0 24 24"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
      : '<svg width="23" height="23" viewBox="0 0 24 24"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>';
    const statusLabel = document.createElement('span');
    statusLabel.className = 'main-status-text ' + (isCompleted ? 'main-status-completed-text' : 'main-status-pending-text');
    statusLabel.textContent = isCompleted ? "Completed" : "Pending";
    statCorner.appendChild(iEl); statCorner.appendChild(statusLabel);
    card.appendChild(statCorner);
    const title = document.createElement('h3'); title.className = 'task-title'; title.textContent = task.title;
    if (task.priority) {
      const priClass = task.priority === "High" ? "priority-high" : (task.priority === "Normal" ? "priority-normal" : "priority-low");
      const priSpan = document.createElement('span'); priSpan.className = `priority-label ${priClass}`; priSpan.textContent = task.priority; title.appendChild(priSpan);
    }
    info.appendChild(title);
    if (task.description) { const desc = document.createElement('p'); desc.className = 'task-desc'; desc.textContent = task.description; info.appendChild(desc); }
    const date1 = document.createElement('p'); date1.className = 'task-date'; date1.innerHTML = `<b>Start:</b> ${task.startDate}`; info.appendChild(date1);
    const date2 = document.createElement('p'); date2.className = 'task-date'; date2.innerHTML = `<b>Due:</b> ${task.dueDate}`; info.appendChild(date2);
    const hrs = document.createElement('p'); hrs.className = 'task-hours'; const days = ((new Date(task.dueDate) - new Date(task.startDate)) / (1000 * 3600 * 24)) + 1;
    hrs.innerHTML = `<b>Total Hours: ${task.hoursSpent} </b>| Suggest: ${(task.hoursSpent / (days)).toFixed(2)} hr/day`; info.appendChild(hrs);
    card.appendChild(info);
    const actions = document.createElement('div'); actions.className = 'task-actions';
    const editBtn = document.createElement('button'); editBtn.innerHTML = '📝'; editBtn.className = 'edit'; editBtn.onclick = () => editTask(index);
    const delBtn = document.createElement('button'); delBtn.innerHTML = '🗑'; delBtn.className = 'delete'; delBtn.onclick = () => deleteTask(index);
    actions.appendChild(editBtn); actions.appendChild(delBtn); card.appendChild(actions);
    tasksList.appendChild(card);
  });
}
function isEditing() { return taskForm.dataset.editIndex !== undefined; }
function resetForm() { taskForm.reset(); delete taskForm.dataset.editIndex; formTitle.textContent = 'Add New Task'; taskForm.querySelector('button[type="submit"]').textContent = 'Add Task'; clearTopicsInputs(); }
function clearTopicsInputs() { while (topicsContainer.firstChild) { topicsContainer.removeChild(topicsContainer.firstChild); } }
function updateTopicInputs() { const num = parseInt(numTopicsInput.value); if (isNaN(num) || num < 0 || num > 20) { clearTopicsInputs(); return; } clearTopicsInputs(); for (let i = 0; i < num; i++) { const inp = document.createElement('input'); inp.type = 'text'; inp.className = 'topic-input'; inp.placeholder = `Topic #${i + 1} name (required)`; inp.required = true; topicsContainer.appendChild(inp); } }
numTopicsInput.addEventListener('input', updateTopicInputs);

taskForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const startDate = document.getElementById('startDate').value;
  const dueDate = document.getElementById('dueDate').value;
  const hoursSpent = parseFloat(document.getElementById('hoursSpent').value);
  const priority = document.getElementById('priority').value;
  const topicInputs = topicsContainer.querySelectorAll('.topic-input');
  let topicsArr = [];
  for (const input of topicInputs) { const val = input.value.trim(); if (val.length === 0) { alert('Please fill all topic names.'); return; } topicsArr.push(val); }
  if (!title || !startDate || !dueDate || isNaN(hoursSpent) || hoursSpent < 1) { alert('Please fill all fields correctly.'); return; }
  if (new Date(startDate) > new Date(dueDate)) { alert('Start Date cannot be after Due Date.'); return; }
  const newTask = { title, description, startDate, dueDate, hoursSpent, priority, topics: topicsArr, completedTopics: [] };
  if (isEditing()) { const index = parseInt(taskForm.dataset.editIndex); tasks[index] = newTask; } else { tasks.push(newTask); }
  saveTasks();
  showSection(mainSection); renderTasks();
});

function deleteTask(index) { if (confirm('Are you sure you want to delete this task?')) { tasks.splice(index, 1); saveTasks(); renderTasks(); } }
function editTask(index) {
  const t = tasks[index]; document.getElementById('title').value = t.title; document.getElementById('description').value = t.description;
  document.getElementById('startDate').value = t.startDate; document.getElementById('dueDate').value = t.dueDate;
  document.getElementById('hoursSpent').value = t.hoursSpent || 1; document.getElementById('priority').value = t.priority;
  if (t.topics.length > 0) { numTopicsInput.value = t.topics.length; updateTopicInputs(); const inps = topicsContainer.querySelectorAll('.topic-input'); inps.forEach((inp, i) => { inp.value = t.topics[i]; }); }
  else { numTopicsInput.value = ''; clearTopicsInputs(); }
  taskForm.dataset.editIndex = index; formTitle.textContent = 'Edit Task'; taskForm.querySelector('button[type="submit"]').textContent = 'Update Task';
  showSection(formSection);
}

function setUProgress(percent) {
  const arc = document.getElementById('progress-arc');
  const totalLen = 282.6;
  arc.style.strokeDashoffset = totalLen * (1 - percent / 100);
  document.getElementById('progress-u-percent').textContent = `${percent}%`;
}
function renderProgress() {
  let totalUnits = 0, completedUnits = 0;
  const progressTaskList = document.getElementById('progress-task-list');
  progressTaskList.innerHTML = '';
  let completedTasks = 0, pendingTasks = 0;
  tasks.forEach((task, tindex) => {
    const taskTotal = task.topics.length || 1;
    const taskCompleted = task.topics.length ? task.completedTopics.length : (task.completedTopics.length > 0 ? 1 : 0);
    if (taskCompleted === taskTotal) completedTasks++;
    else pendingTasks++;
    totalUnits += taskTotal; completedUnits += taskCompleted;
    const li = document.createElement('li'); li.style.justifyContent = 'space-between';
    const progStat = document.createElement('div'); progStat.className = 'prog-title-status';
    const progIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); progIcon.setAttribute('width', '24'); progIcon.setAttribute('height', '24'); progIcon.setAttribute('viewBox', '0 0 24 24');
    if (taskCompleted === taskTotal) { progIcon.innerHTML = `<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>`; progIcon.classList.add("status-icon", "status-completed"); }
    else { progIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`; progIcon.classList.add("status-icon", "status-pending"); }
    const progText = document.createElement('span'); progText.className = 'prog-status-text ' + (taskCompleted === taskTotal ? 'prog-status-completed' : 'prog-status-pending');
    progText.textContent = taskCompleted === taskTotal ? 'Completed' : 'Pending';
    const progTitle = document.createElement('span'); progTitle.className = 'task-title-progress'; progTitle.textContent = task.title;
    progStat.appendChild(progIcon); progStat.appendChild(progTitle); progStat.appendChild(progText);
    let topicsString = '';
    if (task.topics.length > 0) { topicsString = task.topics.join(', '); const topicsSpan = document.createElement('span'); topicsSpan.className = 'prog-topics'; topicsSpan.textContent = ` [Topics: ${topicsString}]`; progStat.appendChild(topicsSpan); }
    li.appendChild(progStat);
    if (task.topics.length > 0) {
      const topicsList = document.createElement('ul'); topicsList.className = 'topics-list'; topicsList.style.display = 'none';
      task.topics.forEach(topic => {
        const topicItem = document.createElement('li'); if (task.completedTopics.includes(topic)) topicItem.classList.add('completed');
        const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = task.completedTopics.includes(topic);
        cb.onclick = e => { e.stopPropagation(); if (cb.checked) { if (!task.completedTopics.includes(topic)) task.completedTopics.push(topic); }
        else { task.completedTopics = task.completedTopics.filter(x => x !== topic); } saveTasks(); renderProgress(); renderTasks(); };
        const label = document.createElement('label'); label.textContent = topic; topicItem.appendChild(cb); topicItem.appendChild(label);
        topicItem.onclick = () => { cb.checked = !cb.checked; cb.onclick(); }; topicsList.appendChild(topicItem);
      }); li.appendChild(topicsList);
      li.onclick = e => { if (e && e.target && (e.target === progIcon || e.target === progTitle || e.target === progText || e.target === li)) { topicsList.style.display = topicsList.style.display === 'block' ? 'none' : 'block'; } };
    } else { li.style.cursor = 'pointer'; li.title = 'Toggle completion'; li.onclick = () => { task.completedTopics = task.completedTopics.length ? [] : ['completed']; saveTasks(); renderProgress(); renderTasks(); }; }
    progressTaskList.appendChild(li);
  });
  const allTasks = tasks.length; const percent = totalUnits ? Math.round((completedUnits / totalUnits) * 100) : 0;
  setUProgress(percent); document.getElementById('all-count').textContent = allTasks; document.getElementById('completed-count').textContent = completedTasks; document.getElementById('pending-count').textContent = pendingTasks;
}
function formatHoursDisplay(val) {
  val = Number(val);
  if (val <= 0) return "-";
  let hr = Math.floor(val);
  let min = Math.round((val - hr) * 60);
  let arr = [];
  if (hr > 0) arr.push(hr === 1 ? "1 hr" : hr + " hrs");
  if (min > 0) arr.push(min + " mins");
  return arr.length ? arr.join(" ") : "0 mins";
}
function renderTimetable() {
  timetableBody.innerHTML = '';
  if (tasks.length === 0) { timetableBody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:#636e72;">No tasks to show.</td></tr>'; return; }
  let minDate = null, maxDate = null;
  tasks.forEach(t => { let sd = new Date(t.startDate), dd = new Date(t.dueDate); if (!minDate || sd < minDate) minDate = sd; if (!maxDate || dd > maxDate) maxDate = dd; });
  function fmt(dt) { return dt.toISOString().slice(0, 10); }
  let dateMap = {}, allDates = []; let tempDate = new Date(minDate); let lastDate = new Date(maxDate);
  while (tempDate <= lastDate) { allDates.push(fmt(tempDate)); tempDate.setDate(tempDate.getDate() + 1); }
  tasks.forEach(task => {
    let s = new Date(task.startDate), d = new Date(task.dueDate); let studyDates = [], revisionDates = [];
    for (let dt = new Date(s); dt <= d; dt.setDate(dt.getDate() + 1)) { const dayOfWeek = new Date(dt).getDay(); if (dayOfWeek === 0) revisionDates.push(fmt(new Date(dt))); else studyDates.push(fmt(new Date(dt))); }
    let hoursPerDay = studyDates && studyDates.length > 0 ? (task.hoursSpent / studyDates.length) : 0;
    studyDates.forEach(ds => { if (!dateMap[ds]) dateMap[ds] = { study: {}, revision: [] }; dateMap[ds].study[task.title] = (dateMap[ds].study[task.title] || 0) + hoursPerDay; });
    revisionDates.forEach(ds => { if (!dateMap[ds]) dateMap[ds] = { study: {}, revision: [] }; dateMap[ds].revision.push(task.title); });
  });
  allDates.forEach(ds => {
    const entry = dateMap[ds] || { study: {}, revision: [] };
    const tr = document.createElement('tr'); const dateTd = document.createElement('td'); dateTd.textContent = ds;
    const typeTd = document.createElement('td');
    if (entry.revision.length > 0 && Object.keys(entry.study).length === 0) { typeTd.textContent = "Revision"; typeTd.className = "revision-date"; }
    else if (Object.keys(entry.study).length > 0 && entry.revision.length === 0) { typeTd.textContent = "Study"; typeTd.className = "study-date"; }
    else if (Object.keys(entry.study).length > 0 && entry.revision.length > 0) { typeTd.innerHTML = '<span class="study-date">Study</span> / <span class="revision-date">Revision</span>'; }
    else { typeTd.textContent = "-"; }
    const taskTd = document.createElement('td'); let txt = "";
    if (Object.keys(entry.study).length > 0) txt += Object.keys(entry.study).map(x => `<span class="study-date">${x}</span>`).join(", ");
    if (entry.revision.length > 0) { if (txt.length > 0) txt += ", "; txt += entry.revision.map(x => `<span class="revision-date">${x}</span>`).join(", "); }
    taskTd.innerHTML = txt.length ? txt : "-";
    const hrsTd = document.createElement('td');
    if (Object.keys(entry.study).length > 1) { hrsTd.innerHTML = Object.entries(entry.study).map(([k, v]) => `<span class="study-date">${k}:</span> ${formatHoursDisplay(v)}`).join("<br>"); }
    else if (Object.keys(entry.study).length === 1) { hrsTd.innerHTML = `${formatHoursDisplay(Object.values(entry.study)[0])}`; }
    else { hrsTd.textContent = '-'; }
    tr.appendChild(dateTd); tr.appendChild(typeTd); tr.appendChild(taskTd); tr.appendChild(hrsTd);
    timetableBody.appendChild(tr);
  });
}

window.onload = () => { showSection(mainSection); showSlide(0); slideInterval = setInterval(nextSlide, 3000); renderTasks(); };
