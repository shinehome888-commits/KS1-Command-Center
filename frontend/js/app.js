// ========================================
// MOBILE MENU TOGGLE
// ========================================
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

// ========================================
// MAIN APPLICATION
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://ks1-command-center-api.onrender.com/api';

    // --- AUTHENTICATION CHECK ---
    const token = localStorage.getItem('ks1_token');
    const userName = localStorage.getItem('ks1_userName') || 'King Solomon';
    const authView = document.getElementById('auth-view');
    const dashboardView = document.getElementById('dashboard-view');
    const userNameDisplay = document.getElementById('user-name-display');

    if (token) {
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        if (userNameDisplay) userNameDisplay.textContent = userName;
        loadAgents(); loadProjects(); loadKnowledge(); loadActivityLog(); loadStats();
    } else {
        authView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }

    // --- AUTH FORM TOGGLING ---
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

    // --- HANDLE LOGIN ---
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

    // --- HANDLE REGISTER ---
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

    // --- HANDLE LOGOUT ---
    document.getElementById('logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to log out of the Command Center?')) {
            localStorage.removeItem('ks1_token');
            localStorage.removeItem('ks1_userName');
            window.location.reload();
        }
    });

    // --- DASHBOARD FUNCTIONS (Only run if logged in) ---
    async function loadStats() {
        try {
            const [projectsRes, agentsRes, knowledgeRes, logsRes] = await Promise.all([
                fetch(`${API_URL}/projects`), fetch(`${API_URL}/agents`),
                fetch(`${API_URL}/knowledge`), fetch(`${API_URL}/logs`)
            ]);
            const [projectsResult, agentsResult, knowledgeResult, logsResult] = await Promise.all([
                projectsRes.json(), agentsRes.json(), knowledgeRes.json(), logsRes.json()
            ]);

            animateCounter('stat-projects-count', projectsResult.success ? projectsResult.data.length : 0);
            const agentsCount = agentsResult.success ? agentsResult.data.length : 0;
            animateCounter('stat-agents-count', agentsCount);
            document.getElementById('stat-agents-online').textContent = `${agentsResult.success ? agentsResult.data.filter(a => a.status === 'Online').length : 0} Online`;
            animateCounter('stat-knowledge-count', knowledgeResult.success ? knowledgeResult.data.length : 0);
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
                loadKnowledge(); loadStats(); await createLog('King Solomon', 'Deleted a knowledge article', 'Success');
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
            loadActivityLog(); loadStats();
        } catch (error) { console.error('❌ Error creating log:', error); }
    }

    // --- MODAL LOGIC (Agent, Project, Knowledge) ---
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
                    reloadFn(); loadStats(); await createLog('King Solomon', successMsg, 'Success');
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

    // --- DELETE FUNCTIONS ---
    window.deleteAgent = async (id) => {
        if (!confirm('Decommission this AI Agent?')) return;
        try {
            const res = await fetch(`${API_URL}/agents/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) { alert('✅ Agent decommissioned!'); loadAgents(); loadStats(); await createLog('King Solomon', 'Decommissioned an AI Agent', 'Success'); }
        } catch (error) { console.error('❌ Error:', error); }
    };

    window.deleteProject = async (id) => {
        if (!confirm('Delete this project?')) return;
        try {
            const res = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) { alert('✅ Project deleted!'); loadProjects(); loadStats(); await createLog('King Solomon', 'Deleted a project', 'Success'); }
        } catch (error) { console.error('❌ Error:', error); }
    };

    window.deleteKnowledge = async (id) => {
        if (!confirm('Delete this knowledge article?')) return;
        try {
            const res = await fetch(`${API_URL}/knowledge/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) { alert('✅ Article deleted!'); loadKnowledge(); loadStats(); await createLog('King Solomon', 'Deleted a knowledge article', 'Success'); }
        } catch (error) { console.error('❌ Error:', error); }
    };

    // --- AI CHAT LOGIC ---
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
        thinkingDiv.innerHTML = '<em>🤔 KS1 Assistant is thinking...</em>';
        chatWindow.appendChild(thinkingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        await createLog('King Solomon', `Sent to AI: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`, 'Success');

        try {
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message })
            });
            const result = await response.json();
            const thinking = document.getElementById('thinking-indicator');
            if (thinking) thinking.remove();

            const botDiv = document.createElement('div');
            botDiv.className = 'chat-message bot';
            if (result.success && result.data && result.data.aiResponse) {
                botDiv.textContent = result.data.aiResponse;
                await createLog('KS1 Assistant', `Responded to: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"`, 'Success');
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

    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            if (e.target.id === 'agent-modal') { document.getElementById('agent-name').value = ''; document.getElementById('agent-role').value = ''; }
            if (e.target.id === 'project-modal') { document.getElementById('project-name').value = ''; document.getElementById('project-description').value = ''; }
            if (e.target.id === 'knowledge-modal') { document.getElementById('knowledge-title').value = ''; document.getElementById('knowledge-content').value = ''; }
            if (e.target.id === 'knowledge-view-modal') { currentViewArticleId = null; }
        }
    });

    console.log('✅ KS1 Command Center initialized successfully');
});
