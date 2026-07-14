// DOM ELEMENTS
const clockDisplay = document.getElementById('clock-display');
const themeToggleBtn = document.getElementById('theme-toggle');
const githubUsernameInput = document.getElementById('github-username-input');
const fetchGithubBtn = document.getElementById('fetch-github-btn');
const githubProfileContainer = document.getElementById('github-profile');
const githubReposContainer = document.getElementById('github-repos');
const githubStatus = document.getElementById('github-status');
const skillsSlidersContainer = document.getElementById('skills-sliders');
const newProjectTitleInput = document.getElementById('new-project-title');
const newProjectStatusSelect = document.getElementById('new-project-status');
const addProjectBtn = document.getElementById('add-project-btn');
const projectsListContainer = document.getElementById('projects-list');
const projectCountIndicator = document.getElementById('project-count');
const simSenderInput = document.getElementById('sim-sender');
const simSubjectInput = document.getElementById('sim-subject');
const simMessageInput = document.getElementById('sim-message');
const simulateMsgBtn = document.getElementById('simulate-msg-btn');
const messagesListContainer = document.getElementById('messages-list');
const inboxCountIndicator = document.getElementById('inbox-count');

// GLOBAL APP STATE
let skillsChart = null;
let currentTheme = localStorage.getItem('theme') || 'dark';

// ----------------------------------------------------
// 1. SYSTEM CLOCK
// ----------------------------------------------------
function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const formattedHours = String(hours).padStart(2, '0');
  
  clockDisplay.innerHTML = `<i class="fa-regular fa-clock"></i> ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();

// ----------------------------------------------------
// 2. THEME SWITCHING WITH CSS VARIABLES & CHART DYNAMICS
// ----------------------------------------------------
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = themeToggleBtn.querySelector('i');
  if (theme === 'light') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
  localStorage.setItem('theme', theme);
  currentTheme = theme;
  
  // Re-style skills chart for the new theme
  updateChartThemeStyles();
}

themeToggleBtn.addEventListener('click', () => {
  const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(targetTheme);
});

// Initialize theme on load
applyTheme(currentTheme);

// ----------------------------------------------------
// 3. GITHUB API INTEGRATION
// ----------------------------------------------------
async function fetchGitHubData(username) {
  githubStatus.textContent = 'Loading...';
  githubStatus.style.color = 'var(--warning)';
  
  try {
    // Fetch profile
    const profileResponse = await fetch(`https://api.github.com/users/${username}`);
    if (!profileResponse.ok) {
      throw new Error(profileResponse.status === 404 ? 'User not found' : 'Failed to fetch user');
    }
    const profile = await profileResponse.ok ? await profileResponse.json() : null;

    // Fetch repositories
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`);
    const repos = reposResponse.ok ? await reposResponse.json() : [];

    renderGitHubProfile(profile);
    renderGitHubRepos(repos);
    
    githubStatus.textContent = 'Active';
    githubStatus.style.color = 'var(--success)';
  } catch (error) {
    console.error(error);
    githubStatus.textContent = 'Error';
    githubStatus.style.color = 'var(--danger)';
    
    githubProfileContainer.innerHTML = `
      <div class="repo-card" style="border-color: var(--danger); background: rgba(248, 81, 73, 0.05);">
        <h4 style="color: var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> Error</h4>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 5px;">
          ${error.message}. Please check the username and try again.
        </p>
      </div>
    `;
    githubReposContainer.innerHTML = '';
  }
}

function renderGitHubProfile(profile) {
  if (!profile) return;
  githubProfileContainer.innerHTML = `
    <div class="github-profile-card">
      <div class="profile-main">
        <img class="profile-avatar" src="${profile.avatar_url}" alt="${profile.name || profile.login}">
        <div class="profile-details">
          <h3>${profile.name || profile.login}</h3>
          <p>@${profile.login}</p>
        </div>
      </div>
      <p class="profile-bio">${profile.bio || 'This developer has no bio written.'}</p>
      <div class="profile-stats-meta">
        <div class="stat-item">
          <div class="stat-num">${profile.public_repos}</div>
          <div class="stat-label">Repos</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">${profile.followers}</div>
          <div class="stat-label">Followers</div>
        </div>
        <div class="stat-item">
          <div class="stat-num">${profile.following}</div>
          <div class="stat-label">Following</div>
        </div>
      </div>
    </div>
  `;
}

function renderGitHubRepos(repos) {
  if (!repos || repos.length === 0) {
    githubReposContainer.innerHTML = `<div class="inbox-empty-state"><p>No public repositories found.</p></div>`;
    return;
  }
  
  githubReposContainer.innerHTML = repos.map(repo => {
    return `
      <div class="repo-card">
        <a href="${repo.html_url}" target="_blank" class="repo-name">
          <i class="fa-solid fa-code-fork"></i> ${repo.name}
        </a>
        <p class="repo-desc">${repo.description || 'No description provided.'}</p>
        <div class="repo-meta">
          <span><i class="fa-solid fa-star" style="color: var(--warning);"></i> ${repo.stargazers_count}</span>
          <span><i class="fa-solid fa-code"></i> ${repo.language || 'Plain Text'}</span>
        </div>
      </div>
    `;
  }).join('');
}

fetchGithubBtn.addEventListener('click', () => {
  const username = githubUsernameInput.value.trim();
  if (username) {
    fetchGitHubData(username);
  }
});

// Load default profile on start
fetchGitHubData('octocat');

// ----------------------------------------------------
// 4. INTERACTIVE SKILLS MATRIX (CHART.JS)
// ----------------------------------------------------
const initialSkills = [
  { name: 'HTML5', value: 90 },
  { name: 'CSS3', value: 85 },
  { name: 'JavaScript', value: 95 },
  { name: 'React', value: 80 },
  { name: 'Python', value: 75 },
  { name: 'SQL', value: 70 }
];

function getThemeColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue('--accent-color').trim(),
    accentSecondary: styles.getPropertyValue('--accent-secondary').trim(),
    textPrimary: styles.getPropertyValue('--text-primary').trim(),
    textMuted: styles.getPropertyValue('--text-muted').trim(),
    panelBorder: styles.getPropertyValue('--panel-border').trim(),
  };
}

function initSkillsRadar() {
  const ctx = document.getElementById('skills-chart').getContext('2d');
  const colors = getThemeColors();
  
  skillsChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: initialSkills.map(s => s.name),
      datasets: [{
        label: 'Proficiency (%)',
        data: initialSkills.map(s => s.value),
        backgroundColor: 'rgba(0, 242, 254, 0.15)',
        borderColor: colors.accent,
        borderWidth: 2,
        pointBackgroundColor: colors.accentSecondary,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors.accent,
        pointRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        r: {
          angleLines: {
            color: colors.textMuted
          },
          grid: {
            color: colors.textMuted
          },
          pointLabels: {
            color: colors.textPrimary,
            font: {
              family: 'Orbitron',
              size: 10
            }
          },
          ticks: {
            display: false,
            stepSize: 20
          },
          min: 0,
          max: 100
        }
      }
    }
  });

  // Render Sliders in UI
  skillsSlidersContainer.innerHTML = initialSkills.map((skill, index) => {
    return `
      <div class="skill-slider-row">
        <div class="slider-label">
          <span>${skill.name}</span>
          <span id="skill-val-${index}">${skill.value}%</span>
        </div>
        <input type="range" min="10" max="100" value="${skill.value}" data-index="${index}" class="skill-range-input">
      </div>
    `;
  }).join('');

  // Attach dynamic listener
  skillsSlidersContainer.addEventListener('input', (e) => {
    if (e.target.classList.contains('skill-range-input')) {
      const idx = parseInt(e.target.getAttribute('data-index'));
      const val = parseInt(e.target.value);
      
      // Update chart value
      skillsChart.data.datasets[0].data[idx] = val;
      skillsChart.update();
      
      // Update UI label
      document.getElementById(`skill-val-${idx}`).textContent = `${val}%`;
    }
  });
}

function updateChartThemeStyles() {
  if (!skillsChart) return;
  const colors = getThemeColors();
  
  // Update Chart Colors dynamically
  skillsChart.data.datasets[0].borderColor = colors.accent;
  skillsChart.data.datasets[0].pointBackgroundColor = colors.accentSecondary;
  skillsChart.data.datasets[0].backgroundColor = currentTheme === 'light' ? 'rgba(127, 0, 255, 0.1)' : 'rgba(0, 242, 254, 0.15)';
  
  skillsChart.options.scales.r.angleLines.color = colors.textMuted;
  skillsChart.options.scales.r.grid.color = colors.textMuted;
  skillsChart.options.scales.r.pointLabels.color = colors.textPrimary;
  
  skillsChart.update();
}

// Initialise Skills Chart
initSkillsRadar();

// ----------------------------------------------------
// 5. PROJECT TRACKER PANEL (LOCAL STORAGE)
// ----------------------------------------------------
let projects = JSON.parse(localStorage.getItem('projects')) || [
  { id: 1, title: 'Personal Portfolio Web', status: 'in_progress', progress: 80 },
  { id: 2, title: 'Chatbot Engine SDK', status: 'planning', progress: 15 },
  { id: 3, title: 'E-Commerce Cart System', status: 'completed', progress: 100 }
];

function saveProjects() {
  localStorage.setItem('projects', JSON.stringify(projects));
  renderProjects();
}

function renderProjects() {
  projectCountIndicator.textContent = `${projects.length} Active`;
  
  if (projects.length === 0) {
    projectsListContainer.innerHTML = `
      <div class="inbox-empty-state">
        <i class="fa-solid fa-diagram-project"></i>
        <p>No active projects. Add one above!</p>
      </div>
    `;
    return;
  }
  
  projectsListContainer.innerHTML = projects.map(project => {
    const statusText = project.status.replace('_', ' ');
    return `
      <div class="project-item" data-id="${project.id}">
        <div class="project-item-header">
          <span class="project-title">${project.title}</span>
          <span class="project-badge badge-${project.status}">${statusText}</span>
        </div>
        
        <div class="project-progress-row">
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" style="width: ${project.progress}%;"></div>
          </div>
          <span class="progress-value-label">${project.progress}%</span>
        </div>
        
        <div class="project-actions">
          <div class="project-progress-adjuster">
            <label>Progress:</label>
            <input type="range" class="proj-range-inline" min="0" max="100" value="${project.progress}">
          </div>
          <button class="delete-project-btn" onclick="deleteProject(${project.id})" title="Delete Project">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Global hook for inline progress adjustments
projectsListContainer.addEventListener('input', (e) => {
  if (e.target.classList.contains('proj-range-inline')) {
    const card = e.target.closest('.project-item');
    const id = parseInt(card.getAttribute('data-id'));
    const val = parseInt(e.target.value);
    
    // Find project and update
    const proj = projects.find(p => p.id === id);
    if (proj) {
      proj.progress = val;
      
      // Auto upgrade status logic
      if (val === 100) {
        proj.status = 'completed';
      } else if (val > 0 && proj.status === 'planning') {
        proj.status = 'in_progress';
      } else if (val === 0 && proj.status === 'in_progress') {
        proj.status = 'planning';
      }
      
      // Update UI bar elements directly for performance
      card.querySelector('.progress-bar-fill').style.width = `${val}%`;
      card.querySelector('.progress-value-label').textContent = `${val}%`;
      
      // Re-badge if changed
      const badge = card.querySelector('.project-badge');
      badge.className = `project-badge badge-${proj.status}`;
      badge.textContent = proj.status.replace('_', ' ');
      
      // Save data back to localStorage
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  }
});

function addProject() {
  const title = newProjectTitleInput.value.trim();
  const status = newProjectStatusSelect.value;
  
  if (!title) return;
  
  let initialProgress = 0;
  if (status === 'in_progress') initialProgress = 20;
  if (status === 'completed') initialProgress = 100;
  
  const newProj = {
    id: Date.now(),
    title: title,
    status: status,
    progress: initialProgress
  };
  
  projects.push(newProj);
  newProjectTitleInput.value = '';
  saveProjects();
}

// Expose delete globally
window.deleteProject = function(id) {
  projects = projects.filter(p => p.id !== id);
  saveProjects();
};

addProjectBtn.addEventListener('click', addProject);
newProjectTitleInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addProject();
});

// Initialise Projects Board
renderProjects();

// ----------------------------------------------------
// 6. PORTFOLIO CONTACT INBOX & NOTIFICATION SYSTEM
// ----------------------------------------------------
let messages = JSON.parse(localStorage.getItem('messages')) || [
  { 
    id: 1, 
    sender: 'Hiring Manager (Initech Corp)', 
    subject: 'Web Developer Position Inquiry', 
    body: 'Hello Rahul,\n\nWe saw your portfolio website and were really impressed by your HTML, CSS and JS skills. We would love to set up an introductory call with you next week.',
    time: '2 hours ago',
    unread: true
  },
  { 
    id: 2, 
    sender: 'GitHub Octocat', 
    subject: 'Welcome to Dev Hub Dashboard!', 
    body: 'Hi Developer!\n\nThis is a simulation feed. Use the form on the left to submit test messages. They will trigger instant visual alerts and synthesized sound pings just like a real integration.',
    time: '1 day ago',
    unread: false
  }
];

function saveMessages() {
  localStorage.setItem('messages', JSON.stringify(messages));
  renderMessages();
}

function renderMessages() {
  const unreadCount = messages.filter(m => m.unread).length;
  inboxCountIndicator.textContent = `${unreadCount} Unread (${messages.length} Total)`;
  
  if (messages.length === 0) {
    messagesListContainer.innerHTML = `
      <div class="inbox-empty-state">
        <i class="fa-solid fa-inbox"></i>
        <p>No messages in simulated inbox.</p>
      </div>
    `;
    return;
  }
  
  messagesListContainer.innerHTML = messages.map(msg => {
    return `
      <div class="message-item ${msg.unread ? 'new-unread' : ''}" data-id="${msg.id}">
        <div class="message-item-header">
          <span class="message-sender">${msg.sender}</span>
          <span class="message-time">${msg.time}</span>
        </div>
        <div class="message-subject">${msg.subject}</div>
        <div class="message-body">${msg.body}</div>
        
        <div class="message-item-actions">
          ${msg.unread ? `<button class="message-action-btn" onclick="markMessageAsRead(${msg.id})"><i class="fa-solid fa-check-double"></i> Mark Read</button>` : ''}
          <button class="message-action-btn delete-msg-btn" onclick="deleteMessage(${msg.id})"><i class="fa-solid fa-trash-can"></i> Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

// WEB AUDIO SYNTHESIZED NOTIFICATION PING
function playSynthNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play dual futuristic rising notes
    const now = ctx.currentTime;
    
    // Note 1 (E5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now); // E5
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);
    
    // Note 2 (A5 - delayed slightly)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.00, now + 0.08); // A5
    gain2.gain.setValueAtTime(0.08, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.25);
    
  } catch (e) {
    console.log("Audio simulation blocked or unsupported: ", e);
  }
}

function simulateIncomingMessage() {
  const sender = simSenderInput.value.trim();
  const subject = simSubjectInput.value.trim();
  const message = simMessageInput.value.trim();
  
  if (!sender || !subject || !message) {
    alert("Please fill in all simulation fields!");
    return;
  }
  
  const newMsg = {
    id: Date.now(),
    sender: sender,
    subject: subject,
    body: message,
    time: 'Just now',
    unread: true
  };
  
  messages.unshift(newMsg);
  
  // Reset form inputs
  simSenderInput.value = '';
  simSubjectInput.value = '';
  simMessageInput.value = '';
  
  // Play sound indicator
  playSynthNotificationSound();
  
  saveMessages();
}

window.markMessageAsRead = function(id) {
  const msg = messages.find(m => m.id === id);
  if (msg) {
    msg.unread = false;
    saveMessages();
  }
};

window.deleteMessage = function(id) {
  messages = messages.filter(m => m.id !== id);
  saveMessages();
};

simulateMsgBtn.addEventListener('click', simulateIncomingMessage);

// Initialise Inbox
renderMessages();
