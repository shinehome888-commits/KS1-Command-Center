const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
const closeSidebar = document.getElementById('close-sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSidebarMenu() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openSidebar);
if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarMenu);
if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebarMenu);

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        if (window.innerWidth <= 768) closeSidebarMenu();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://ks1-command-center-api.onrender.com/api';

    const token = localStorage.getItem('ks1_token');
    const userName = localStorage.getItem('ks1_userName') || 'King Solomon';
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const userNameDisplay = document.getElementById('user-name-display');

    // ✅ CONVERSATION STATE
    let currentConversationId = null;
    let conversationHistory = [];

    if (token) {
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        if (userNameDisplay) userNameDisplay.textContent = userName;
        loadAgents(); loadProjects(); loadKnowledge(); loadCommunications(); loadActivityLog(); loadStats();
        loadConversationHistory();
        setTimeout(renderCharts, 500);
    } else {
        authView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    document.getElementById('show-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
    });

    document.getElementById('show-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');

        btn.textContent = 'Signing In...';
        btn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();

            if (result.success) {
                localStorage.setItem('ks1_token', result.data.token);
                localStorage.setItem('ks1_userName', result.data.name);
                alert('✅ Welcome back to the Command Center!');
                window.location.reload();
            } else {
                alert('❌ ' + result.message);
            }
        } catch (error) {
            alert('❌ Network error. Please try again.');
        } finally {
            btn.textContent = 'Sign In';
            btn.disabled = false;
        }
    });

    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const btn = document.getElementById('register-btn');

        btn.textContent = 'Creating Account...';
        btn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const result = await response.json();

            if (result.success) {
                localStorage.setItem('ks1_token', result.data.token);
                localStorage.setItem('ks1_userName', result.data.name);
                alert('✅ Account created successfully! Welcome to the Command Center.');
                window.location.reload();
            } else {
                alert('❌ ' + result.message);
            }
        } catch (error) {
            alert('❌ Network error. Please try again.');
        } finally {
            btn.textContent = 'Create Account';
            btn.disabled = false;
        }
    });

    function performLogout() {
        if (confirm('Are you sure you want to log out of the Command Center?')) {
            localStorage.removeItem('ks1_token');
            localStorage.removeItem('ks1_userName');
            window.location.reload();
        }
    }

    document.getElementById('logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        performLogout();
    });

    document.getElementById('mobile-logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        performLogout();
    });

    document.getElementById('desktop-logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        performLogout();
    });

    async function loadStats() {
        try {
            const [projectsRes, agentsRes, knowledgeRes, logsRes, commsRes] = await Promise.all([
                fetch(`${API_URL}/projects`), fetch(`${API_URL}/agents`),
                fetch(`${API_URL}/knowledge`), fetch(`${API_URL}/logs`),
                fetch(`${API_URL}/communications`)
            ]);
            const [projectsResult, agentsResult, knowledgeResult, logsResult, commsResult] = await Promise.all([
                projectsRes.json(), agentsRes.json(), knowledgeRes.json(), logsRes.json(), commsRes.json()
            ]);

            animateCounter('stat-projects-count', projectsResult.success ? projectsResult.data.length : 0);
            const agentsCount = agentsResult.success ? agentsResult.data.length : 0;
            animateCounter('stat-agents-count', agentsCount);
            document.getElementById('stat-agents-online').textContent = `${agentsResult.success ? agentsResult.data.filter(a => a.status === 'Online').length : 0} Online`;
            animateCounter('stat-knowledge-count', knowledgeResult.success ? knowledgeResult.data.length : 0);
            animateCounter('stat-communications-count', commsResult.success ? commsResult.data.length : 0);
            animateCounter('stat-activity-count', logsResult.success ? logsResult.data.length : 0);
        } catch (error) { console.error('❌ Error loading stats:', error); }
    }

    function animateCounter(elementId, target) {
        const element = document.getElementById(elementId);
        if (!element) return;
        const duration = 800, steps = 30, increment = target / steps;
        let current = 0, step = 0;
        const timer = setInterval(() => {
            step++; current += increment;
            if (step >= steps) { element.textContent = target; clearInterval(timer); }
            else { element.textContent = Math.floor(current); }
        }, duration / steps);
    }

    let projectsChartInstance = null;
    let agentsChartInstance = null;
    let activityChartInstance = null;
    let communicationsChartInstance = null;

    async function renderCharts() {
        try {
            const [projectsRes, agentsRes, logsRes, commsRes] = await Promise.all([
                fetch(`${API_URL}/projects`),
                fetch(`${API_URL}/agents`),
                fetch(`${API_URL}/logs`),
                fetch(`${API_URL}/communications`)
            ]);

            const [projectsResult, agentsResult, logsResult, commsResult] = await Promise.all([
                projectsRes.json(), agentsRes.json(), logsRes.json(), commsRes.json()
            ]);

            renderProjectsChart(projectsResult.data || []);
            renderAgentsChart(agentsResult.data || []);
            renderActivityChart(logsResult.data || []);
            renderCommunicationsChart(commsResult.data || []);
        } catch (error) {
            console.error('❌ Error rendering charts:', error);
        }
    }

    function renderProjectsChart(projects) {
        const ctx = document.getElementById('projectsChart');
        if (!ctx) return;
        if (projectsChartInstance) projectsChartInstance.destroy();

        const activeCount = projects.filter(p => p.status === 'Active').length;
        const planningCount = projects.filter(p => p.status === 'Planning').length;
        const completedCount = projects.filter(p => p.status === 'Completed').length;
        const otherCount = projects.length - activeCount - planningCount - completedCount;

        projectsChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Planning', 'Completed', 'Other'],
                datasets: [{
                    data: [activeCount, planningCount, completedCount, otherCount],
                    backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(212, 175, 55, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(107, 114, 128, 0.8)'],
                    borderColor: ['rgba(16, 185, 129, 1)', 'rgba(212, 175, 55, 1)', 'rgba(59, 130, 246, 1)', 'rgba(107, 114, 128, 1)'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 11 }, padding: 15 } } }
            }
        });
    }

    function renderAgentsChart(agents) {
        const ctx = document.getElementById('agentsChart');
        if (!ctx) return;
        if (agentsChartInstance) agentsChartInstance.destroy();

        agentsChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Online', 'Ready', 'Standby'],
                datasets: [{
                    label: 'Agents',
                    data: [agents.filter(a => a.status === 'Online').length, agents.filter(a => a.status === 'Ready').length, agents.filter(a => a.status === 'Standby').length],
                    backgroundColor: ['rgba(16, 185, 129, 0.7)', 'rgba(212, 175, 55, 0.7)', 'rgba(107, 114, 128, 0.7)'],
                    borderColor: ['rgba(16, 185, 129, 1)', 'rgba(212, 175, 55, 1)', 'rgba(107, 114, 128, 1)'],
                    borderWidth: 2, borderRadius: 8
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: 'rgba(255, 255, 255, 0.7)', stepSize: 1 }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                    x: { ticks: { color: 'rgba(255, 255, 255, 0.7)' }, grid: { display: false } }
                }
            }
        });
    }

    function renderActivityChart(logs) {
        const ctx = document.getElementById('activityChart');
        if (!ctx) return;
        if (activityChartInstance) activityChartInstance.destroy();

        const recentLogs = logs.slice(0, 7).reverse();
        const labels = recentLogs.map(log => new Date(log.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        const data = recentLogs.map((_, index) => index + 1);

        activityChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels.length > 0 ? labels : ['No Data'],
                datasets: [{
                    label: 'Activity',
                    data: data.length > 0 ? data : [0],
                    borderColor: 'rgba(212, 175, 55, 1)',
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    borderWidth: 3, fill: true, tension: 0.4,
                    pointBackgroundColor: 'rgba(212, 175, 55, 1)',
                    pointBorderColor: 'rgba(255, 255, 255, 1)',
                    pointBorderWidth: 2, pointRadius: 5, pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: 'rgba(255, 255, 255, 0.7)', stepSize: 1 }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                    x: { ticks: { color: 'rgba(255, 255, 255, 0.7)' }, grid: { display: false } }
                }
            }
        });
    }

    function renderCommunicationsChart(comms) {
        const ctx = document.getElementById('communicationsChart');
        if (!ctx) return;
        if (communicationsChartInstance) communicationsChartInstance.destroy();

        const categories = ['Announcement', 'News', 'Update', 'Event', 'Alert'];
        const counts = categories.map(cat => comms.filter(c => c.category === cat).length);

        communicationsChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: counts,
                    backgroundColor: ['rgba(245, 158, 11, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(16, 185, 129, 0.8)', 'rgba(168, 85, 247, 0.8)', 'rgba(239, 68, 68, 0.8)'],
                    borderColor: ['rgba(245, 158, 11, 1)', 'rgba(59, 130, 246, 1)', 'rgba(16, 185, 129, 1)', 'rgba(168, 85, 247, 1)', 'rgba(239, 68, 68, 1)'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255, 255, 255, 0.8)', font: { size: 11 }, padding: 15 } } }
            }
        });
    }

    async function loadAgents() {
        try {
            const response = await fetch(`${API_URL}/agents`);
            const result = await response.json();
            if (result.success && result.data.length > 0) {
                const container = document.getElementById('agents-grid');
                container.innerHTML = '';
                result.data.forEach(agent => {
                    const card = document.createElement('div');
                    card.className = 'card agent-card';
                    card.innerHTML = `
                        <button class="delete-btn" onclick="deleteAgent('${agent._id}')">Delete</button>
                        <div class="status-indicator ${agent.status.toLowerCase()}"></div>
                        <h4>${agent.name}</h4><p class="role">${agent.role}</p><span class="status-text">${agent.status}</span>
                    `;
                    container.appendChild(card);
                });
            }
        } catch (error) { console.error('❌ Error loading agents:', error); }
    }

    async function loadProjects() {
        try {
            const response = await fetch(`${API_URL}/projects`);
            const result = await response.json();
            if (result.success && result.data.length > 0) {
                const container = document.getElementById('projects-grid');
                container.innerHTML = '';
                result.data.forEach(project => {
                    const card = document.createElement('div');
                    card.className = 'card project-card';
                    card.innerHTML = `
                        <button class="delete-btn" onclick="deleteProject('${project._id}')">Delete</button>
                        <h4>${project.name}</h4><p class="description">${project.description}</p>
                        <p class="category">Category: ${project.category}</p><span class="badge ${project.status.toLowerCase()}">${project.status}</span>
                    `;
                    container.appendChild(card);
                });
            }
        } catch (error) { console.error('❌ Error loading projects:', error); }
    }

    async function loadKnowledge() {
        try {
            const response = await fetch(`${API_URL}/knowledge`);
            const result = await response.json();
            const container = document.getElementById('knowledge-grid');
            if (result.success && result.data.length > 0) {
                container.innerHTML = '';
                result.data.forEach(article => {
                    const date = new Date(article.createdAt).toLocaleDateString();
                    const snippet = article.content.substring(0, 120) + (article.content.length > 120 ? '...' : '');
                    const card = document.createElement('div');
                    card.className = 'card knowledge-card';
                    card.innerHTML = `
                        <button class="delete-btn" onclick="event.stopPropagation(); deleteKnowledge('${article._id}')">Delete</button>
                        <h4>${article.title}</h4><p class="meta">${article.category} • ${date}</p><p class="snippet">${snippet}</p>
                    `;
                    card.addEventListener('click', () => openArticleView(article));
                    container.appendChild(card);
                });
            }
        } catch (error) { console.error('❌ Error loading knowledge:', error); }
    }

    async function loadCommunications() {
        try {
            const response = await fetch(`${API_URL}/communications`);
            const result = await response.json();
            const container = document.getElementById('communications-grid');
            if (!container) return;
            
            if (result.success && result.data.length > 0) {
                container.innerHTML = '';
                result.data.forEach(comm => {
                    const date = new Date(comm.createdAt);
                    const timeAgo = getTimeAgo(date);
                    const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                    const formattedTime = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                    
                    const card = document.createElement('div');
                    card.className = 'card communication-card';
                    card.innerHTML = `
                        <button class="delete-btn" onclick="deleteCommunication('${comm._id}')">Delete</button>
                        <div class="communication-badges">
                            <span class="comm-category-badge ${comm.category.toLowerCase()}">${getCategoryIcon(comm.category)} ${comm.category}</span>
                            <span class="comm-priority-badge ${comm.priority.toLowerCase()}">${comm.priority}</span>
                        </div>
                        <h4>${comm.title}</h4>
                        <div class="communication-content" id="comm-content-${comm._id}">${comm.content}</div>
                        <button class="read-more-btn" onclick="toggleReadMore('${comm._id}', this)" style="display: none;">Read more</button>
                        <div class="communication-footer">
                            <span class="communication-author">By ${comm.author}</span>
                            <span class="communication-time" title="${formattedDate} ${formattedTime}">${timeAgo}</span>
                        </div>
                    `;
                    container.appendChild(card);
                    
                    setTimeout(() => {
                        const contentEl = document.getElementById(`comm-content-${comm._id}`);
                        const readMoreBtn = card.querySelector('.read-more-btn');
                        if (contentEl && contentEl.scrollHeight > contentEl.clientHeight + 5) {
                            readMoreBtn.style.display = 'block';
                        }
                    }, 100);
                });
            } else {
                container.innerHTML = '<p style="color: rgba(255,255,255,0.5); text-align: center; padding: 20px;">No communications yet. Post your first announcement!</p>';
            }
        } catch (error) { console.error('❌ Error loading communications:', error); }
    }

    function getCategoryIcon(category) {
        const icons = { 'Announcement': '📢', 'News': '📰', 'Update': '🔄', 'Event': '📅', 'Alert': '⚠️' };
        return icons[category] || '📢';
    }

    function getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    }

    window.toggleReadMore = (id, btn) => {
        const content = document.getElementById(`comm-content-${id}`);
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            btn.textContent = 'Read more';
        } else {
            content.classList.add('expanded');
            btn.textContent = 'Show less';
        }
    };

    let currentViewArticleId = null;
    function openArticleView(article) {
        currentViewArticleId = article._id;
        const date = new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        document.getElementById('view-article-title').textContent = article.title;
        document.getElementById('view-article-category').textContent = article.category;
        document.getElementById('view-article-date').textContent = `Published: ${date}`;
        document.getElementById('view-article-content').textContent = article.content;
        document.getElementById('knowledge-view-modal').style.display = 'block';
    }
    
    const viewModal = document.getElementById('knowledge-view-modal');
    document.getElementById('close-view-modal')?.addEventListener('click', () => { viewModal.style.display = 'none'; currentViewArticleId = null; });
    document.getElementById('close-view-btn')?.addEventListener('click', () => { viewModal.style.display = 'none'; currentViewArticleId = null; });
    document.getElementById('delete-view-article-btn')?.addEventListener('click', async () => {
        if (!currentViewArticleId || !confirm('Delete this article?')) return;
        try {
            const res = await fetch(`${API_URL}/knowledge/${currentViewArticleId}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) {
                alert('✅ Deleted!'); viewModal.style.display = 'none'; currentViewArticleId = null;
                loadKnowledge(); await createLog(userName, 'Deleted a knowledge article', 'Success');
            }
        } catch (error) { console.error('❌ Error:', error); }
    });

    async function loadActivityLog() {
        try {
            const response = await fetch(`${API_URL}/logs`);
            const result = await response.json();
            const container = document.getElementById('activity-log');
            container.innerHTML = '';
            if (result.success && result.data.length > 0) {
                result.data.forEach(log => {
                    const logItem = document.createElement('div');
                    logItem.className = 'log-item';
                    logItem.innerHTML = `
                        <div class="log-details"><strong class="log-actor">${log.actor}</strong><span class="log-action">${log.action}</span></div>
                        <div class="log-meta"><span class="badge-log">${log.status}</span><span class="log-time">${new Date(log.createdAt).toLocaleString()}</span></div>
                    `;
                    container.appendChild(logItem);
                });
            } else {
                container.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No activity logs yet.</p>';
            }
        } catch (error) { console.error('❌ Error loading logs:', error); }
    }

    async function createLog(actor, action, status = 'Success') {
        try {
            await fetch(`${API_URL}/logs`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actor, action, status })
            });
            loadActivityLog();
        } catch (error) { console.error('❌ Error creating log:', error); }
    }

    const setupModal = (modalId, addBtnId, closeBtnId, cancelBtnId, submitBtnId, endpoint, payloadFn, successMsg, reloadFn, btnLabel, clearFn) => {
        const modal = document.getElementById(modalId);
        const addBtn = document.getElementById(addBtnId);
        const closeBtn = document.getElementById(closeBtnId);
        const cancelBtn = document.getElementById(cancelBtnId);
        const submitBtn = document.getElementById(submitBtnId);

        addBtn?.addEventListener('click', () => modal.style.display = 'block');
        closeBtn?.addEventListener('click', () => { modal.style.display = 'none'; clearFn(); });
        cancelBtn?.addEventListener('click', () => { modal.style.display = 'none'; clearFn(); });

        submitBtn?.addEventListener('click', async () => {
            const payload = payloadFn();
            if (!payload) return;
            submitBtn.textContent = 'Saving...'; submitBtn.disabled = true;
            try {
                const res = await fetch(`${API_URL}${endpoint}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.success) {
                    alert(`✅ ${successMsg}`); modal.style.display = 'none'; clearFn();
                    reloadFn(); await createLog(userName, successMsg, 'Success');
                    setTimeout(renderCharts, 300);
                } else { alert('❌ ' + result.message); }
            } catch (error) { alert('❌ Network error.'); }
            finally { submitBtn.textContent = btnLabel; submitBtn.disabled = false; }
        });
    };

    setupModal('agent-modal', 'add-agent-btn', 'close-agent-modal', 'cancel-agent-btn', 'submit-agent-btn', '/agents',
        () => {
            const n = document.getElementById('agent-name').value.trim();
            const r = document.getElementById('agent-role').value.trim();
            const s = document.getElementById('agent-status').value;
            if (!n || !r) { alert('Fill name and role'); return null; }
            return { name: n, role: r, status: s };
        }, 'Agent deployed successfully!', loadAgents, 'Deploy Agent',
        () => { document.getElementById('agent-name').value = ''; document.getElementById('agent-role').value = ''; }
    );

    setupModal('project-modal', 'add-project-btn', 'close-modal', 'cancel-project-btn', 'submit-project-btn', '/projects',
        () => {
            const n = document.getElementById('project-name').value.trim();
            const d = document.getElementById('project-description').value.trim();
            const c = document.getElementById('project-category').value;
            if (!n || !d) { alert('Fill name and description'); return null; }
            return { name: n, description: d, category: c, status: 'Planning' };
        }, 'Project created successfully!', loadProjects, 'Create Project',
        () => { document.getElementById('project-name').value = ''; document.getElementById('project-description').value = ''; }
    );

    setupModal('knowledge-modal', 'add-knowledge-btn', 'close-knowledge-modal', 'cancel-knowledge-btn', 'submit-knowledge-btn', '/knowledge',
        () => {
            const t = document.getElementById('knowledge-title').value.trim();
            const c = document.getElementById('knowledge-category').value;
            const cnt = document.getElementById('knowledge-content').value.trim();
            if (!t || !cnt) { alert('Fill title and content'); return null; }
            return { title: t, category: c, content: cnt };
        }, 'Knowledge article saved successfully!', loadKnowledge, 'Save Article',
        () => { document.getElementById('knowledge-title').value = ''; document.getElementById('knowledge-content').value = ''; }
    );

    setupModal('communication-modal', 'add-communication-btn', 'close-communication-modal', 'cancel-communication-btn', 'submit-communication-btn', '/communications',
        () => {
            const t = document.getElementById('communication-title').value.trim();
            const c = document.getElementById('communication-category').value;
            const p = document.getElementById('communication-priority').value;
            const cnt = document.getElementById('communication-content').value.trim();
            if (!t || !cnt) { alert('Fill title and content'); return null; }
            return { title: t, category: c, priority: p, content: cnt, author: userName };
        }, 'Announcement posted successfully!', loadCommunications, 'Post Announcement',
        () => { 
            document.getElementById('communication-title').value = ''; 
            document.getElementById('communication-content').value = '';
            document.getElementById('communication-category').value = 'Announcement';
            document.getElementById('communication-priority').value = 'Normal';
        }
    );

    window.deleteAgent = async (id) => {
        if (!confirm('Decommission this AI Agent?')) return;
        try {
            const res = await fetch(`${API_URL}/agents/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) { alert('✅ Agent decommissioned!'); loadAgents(); await createLog(userName, 'Decommissioned an AI Agent', 'Success'); setTimeout(renderCharts, 300); }
        } catch (error) { console.error('❌ Error:', error); }
    };

    window.deleteProject = async (id) => {
        if (!confirm('Delete this project?')) return;
        try {
            const res = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) { alert('✅ Project deleted!'); loadProjects(); await createLog(userName, 'Deleted a project', 'Success'); setTimeout(renderCharts, 300); }
        } catch (error) { console.error('❌ Error:', error); }
    };

    window.deleteKnowledge = async (id) => {
        if (!confirm('Delete this knowledge article?')) return;
        try {
            const res = await fetch(`${API_URL}/knowledge/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) { alert('✅ Article deleted!'); loadKnowledge(); await createLog(userName, 'Deleted a knowledge article', 'Success'); }
        } catch (error) { console.error('❌ Error:', error); }
    };

    window.deleteCommunication = async (id) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            const res = await fetch(`${API_URL}/communications/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) { alert('✅ Announcement deleted!'); loadCommunications(); await createLog(userName, 'Deleted an announcement', 'Success'); setTimeout(renderCharts, 300); }
        } catch (error) { console.error('❌ Error:', error); }
    };

    // ✅ CONVERSATION HISTORY FUNCTIONS
    async function loadConversationHistory() {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                conversationHistory = result.data;
                renderConversationHistory();
            }
        } catch (error) {
            console.error('❌ Error loading conversation history:', error);
        }
    }

    function renderConversationHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        if (conversationHistory.length === 0) {
            historyList.innerHTML = '<p class="history-empty">No conversations yet. Start chatting!</p>';
            return;
        }

        historyList.innerHTML = '';
        conversationHistory.forEach(conv => {
            const item = document.createElement('div');
            item.className = 'history-item' + (currentConversationId === conv._id ? ' active' : '');
            const date = new Date(conv.updatedAt).toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            });
            item.innerHTML = `
                <div class="history-item-content">
                    <div class="history-item-title">💬 ${conv.title}</div>
                    <div class="history-item-date">${date}</div>
                </div>
                <button class="history-item-delete" onclick="deleteConversation('${conv._id}', event)">🗑️</button>
            `;
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('history-item-delete')) {
                    loadConversation(conv._id);
                }
            });
            historyList.appendChild(item);
        });
    }

    async function loadConversation(conversationId) {
        if (!token) return;
        try {
            const response = await fetch(`${API_URL}/conversations/${conversationId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            
            if (result.success) {
                currentConversationId = conversationId;
                const chatWindow = document.getElementById('chat-window');
                chatWindow.innerHTML = '';
                
                // Show conversation title
                const titleDisplay = document.getElementById('current-conversation-title');
                const titleText = document.getElementById('current-title-text');
                if (titleDisplay && titleText) {
                    titleText.textContent = result.data.title;
                    titleDisplay.classList.remove('hidden');
                }
                
                // Render all messages
                result.data.messages.forEach(msg => {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = `chat-message ${msg.role === 'user' ? 'user' : 'bot'}`;
                    msgDiv.textContent = msg.content;
                    chatWindow.appendChild(msgDiv);
                });
                
                chatWindow.scrollTop = chatWindow.scrollHeight;
                renderConversationHistory();
            }
        } catch (error) {
            console.error('❌ Error loading conversation:', error);
        }
    }

    window.deleteConversation = async (id, event) => {
        event.stopPropagation();
        if (!confirm('Delete this conversation?')) return;
        try {
            const response = await fetch(`${API_URL}/conversations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                if (currentConversationId === id) {
                    startNewConversation();
                }
                await loadConversationHistory();
            }
        } catch (error) {
            console.error('❌ Error deleting conversation:', error);
        }
    };

    function startNewConversation() {
        currentConversationId = null;
        const chatWindow = document.getElementById('chat-window');
        chatWindow.innerHTML = '<div class="chat-message bot">System initialized. Awaiting your command, King Solomon.</div>';
        
        const titleDisplay = document.getElementById('current-conversation-title');
        if (titleDisplay) titleDisplay.classList.add('hidden');
        
        renderConversationHistory();
    }

    // ✅ CHAT HISTORY & ACTION BUTTONS
    document.getElementById('toggle-history-btn')?.addEventListener('click', () => {
        const history = document.getElementById('conversation-history');
        if (history) history.classList.toggle('hidden');
    });

    document.getElementById('new-conversation-btn')?.addEventListener('click', () => {
        startNewConversation();
    });

    document.getElementById('clear-all-history-btn')?.addEventListener('click', async () => {
        if (!confirm('Delete ALL conversation history? This cannot be undone!')) return;
        try {
            const response = await fetch(`${API_URL}/conversations/clear/all`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                startNewConversation();
                await loadConversationHistory();
                alert('✅ All conversations cleared!');
            }
        } catch (error) {
            console.error('❌ Error clearing history:', error);
        }
    });

    // ✅ AI CHAT WITH CONVERSATION TRACKING
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatWindow = document.getElementById('chat-window');

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        const userDiv = document.createElement('div');
        userDiv.className = 'chat-message user';
        userDiv.textContent = message;
        chatWindow.appendChild(userDiv);
        chatInput.value = '';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'chat-message bot';
        thinkingDiv.id = 'thinking-indicator';
        thinkingDiv.innerHTML = '<em>🧠 KS1 Assistant is reading Knowledge Base...</em>';
        chatWindow.appendChild(thinkingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        await createLog(userName, `Sent to AI: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`, 'Success');

        try {
            const requestBody = { message };
            if (currentConversationId) {
                requestBody.conversationId = currentConversationId;
            }

            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST', 
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }, 
                body: JSON.stringify(requestBody)
            });
            const result = await response.json();
            const thinking = document.getElementById('thinking-indicator');
            if (thinking) thinking.remove();

            const botDiv = document.createElement('div');
            botDiv.className = 'chat-message bot';
            if (result.success && result.data && result.data.aiResponse) {
                botDiv.textContent = result.data.aiResponse;
                await createLog('KS1 Assistant', `Responded to: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"`, 'Success');
                
                // ✅ UPDATE CONVERSATION ID IF NEW
                if (result.data.conversationId && !currentConversationId) {
                    currentConversationId = result.data.conversationId;
                    
                    // Show conversation title
                    const titleDisplay = document.getElementById('current-conversation-title');
                    const titleText = document.getElementById('current-title-text');
                    if (titleDisplay && titleText && result.data.conversationTitle) {
                        titleText.textContent = result.data.conversationTitle;
                        titleDisplay.classList.remove('hidden');
                    }
                    
                    // Refresh history list
                    await loadConversationHistory();
                }
            } else {
                botDiv.textContent = "I'm having a moment, King Solomon. Please try again.";
            }
            chatWindow.appendChild(botDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        } catch (error) {
            const thinking = document.getElementById('thinking-indicator');
            if (thinking) thinking.remove();
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chat-message bot';
            errorDiv.textContent = "❌ Network error. Please check your connection, King Solomon.";
            chatWindow.appendChild(errorDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    };

    chatSend?.addEventListener('click', sendMessage);
    chatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            if (e.target.id === 'agent-modal') { document.getElementById('agent-name').value = ''; document.getElementById('agent-role').value = ''; }
            if (e.target.id === 'project-modal') { document.getElementById('project-name').value = ''; document.getElementById('project-description').value = ''; }
            if (e.target.id === 'knowledge-modal') { document.getElementById('knowledge-title').value = ''; document.getElementById('knowledge-content').value = ''; }
            if (e.target.id === 'communication-modal') { 
                document.getElementById('communication-title').value = ''; 
                document.getElementById('communication-content').value = '';
                document.getElementById('communication-category').value = 'Announcement';
                document.getElementById('communication-priority').value = 'Normal';
            }
            if (e.target.id === 'knowledge-view-modal') { currentViewArticleId = null; }
        }
    });

    console.log('✅ KS1 Command Center initialized successfully');
});
