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

    let currentConversationId = null;
    let conversationHistory = [];
    let agentsData = [];
    let memoryStats = {};
    let currentViewArticleId = null;
    let allKnowledgeArticles = [];

    if (token) {
        authView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        if (userNameDisplay) userNameDisplay.textContent = userName;
        loadMemoryStats();
        loadAgents(); loadProjects(); loadKnowledge(); loadCommunications(); 
        loadActivityLog(); loadStats(); loadTasks();
        loadConversationHistory();
        loadKnowledgeInsights();
        setTimeout(renderCharts, 500);
    } else {
        authView.classList.remove('hidden');
        dashboardView.classList.add('hidden');
    }

    // ========================================
    // COLLAPSIBLE SECTIONS
    // ========================================
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetContent = document.getElementById(targetId);
            
            if (targetContent) {
                targetContent.classList.toggle('hidden');
                btn.classList.toggle('active');
                
                const btnText = btn.querySelector('.btn-text');
                if (btnText) {
                    const currentText = btnText.textContent;
                    if (currentText.startsWith('View')) {
                        btnText.textContent = currentText.replace('View', 'Hide');
                    } else {
                        btnText.textContent = currentText.replace('Hide', 'View');
                    }
                }
                
                if (targetId === 'charts-content' && !targetContent.classList.contains('hidden')) {
                    setTimeout(renderCharts, 100);
                }
            }
        });
    });

    // ========================================
    // AUTHENTICATION
    // ========================================
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

    // ========================================
    // STATS & CHARTS
    // ========================================
    async function loadStats() {
        try {
            const [projectsRes, agentsRes, knowledgeRes, logsRes, commsRes, tasksRes] = await Promise.all([
                fetch(`${API_URL}/projects`), fetch(`${API_URL}/agents`),
                fetch(`${API_URL}/knowledge`), fetch(`${API_URL}/logs`),
                fetch(`${API_URL}/communications`),
                fetch(`${API_URL}/tasks`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            const [projectsResult, agentsResult, knowledgeResult, logsResult, commsResult, tasksResult] = await Promise.all([
                projectsRes.json(), agentsRes.json(), knowledgeRes.json(), logsRes.json(), commsRes.json(), tasksRes.json()
            ]);

            animateCounter('stat-projects-count', projectsResult.success ? projectsResult.data.length : 0);
            const agentsCount = agentsResult.success ? agentsResult.data.length : 0;
            animateCounter('stat-agents-count', agentsCount);
            document.getElementById('stat-agents-online').textContent = `${agentsResult.success ? agentsResult.data.filter(a => a.status === 'Online').length : 0} Online`;
            animateCounter('stat-knowledge-count', knowledgeResult.success ? knowledgeResult.data.length : 0);
            animateCounter('stat-tasks-count', tasksResult.success ? tasksResult.data.length : 0);
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
                fetch(`${API_URL}/projects`), fetch(`${API_URL}/agents`),
                fetch(`${API_URL}/logs`), fetch(`${API_URL}/communications`)
            ]);
            const [projectsResult, agentsResult, logsResult, commsResult] = await Promise.all([
                projectsRes.json(), agentsRes.json(), logsRes.json(), commsRes.json()
            ]);

            renderProjectsChart(projectsResult.data || []);
            renderAgentsChart(agentsResult.data || []);
            renderActivityChart(logsResult.data || []);
            renderCommunicationsChart(commsResult.data || []);
        } catch (error) { console.error('❌ Error rendering charts:', error); }
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

    // ========================================
    // DATA LOADING
    // ========================================
    async function loadAgents() {
        try {
            const response = await fetch(`${API_URL}/agents`);
            const result = await response.json();
            if (result.success && result.data.length > 0) {
                agentsData = result.data;
                const container = document.getElementById('agents-grid');
                container.innerHTML = '';
                result.data.forEach(agent => {
                    const card = document.createElement('div');
                    card.className = 'card agent-card';
                    card.innerHTML = `
                        <div class="status-indicator ${agent.status.toLowerCase()}"></div>
                        <h4>${agent.name}</h4>
                        <p class="role">${agent.role}</p>
                        <span class="status-text">${agent.status}</span>
                        ${renderMemoryIndicator(agent)}
                        <span class="assign-task-hint">🎯 Click to assign task</span>
                    `;
                    card.addEventListener('click', (e) => {
                        if (!e.target.closest('.memory-indicator')) {
                            openTaskModal(agent);
                        }
                    });
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

    // ✅ KNOWLEDGE WITH SEARCH & FILTERS
    async function loadKnowledge() {
        try {
            const response = await fetch(`${API_URL}/knowledge`);
            const result = await response.json();
            
            if (result.success) {
                allKnowledgeArticles = result.data;
                renderFilteredKnowledge();
            }
        } catch (error) { console.error('❌ Error loading knowledge:', error); }
    }

    function renderFilteredKnowledge() {
        const searchTerm = document.getElementById('knowledge-search')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('knowledge-category-filter')?.value || '';
        const verifiedFilter = document.getElementById('knowledge-verified-filter')?.value || '';
        const sortBy = document.getElementById('knowledge-sort')?.value || 'newest';

        let filtered = allKnowledgeArticles.filter(article => {
            const matchesSearch = searchTerm === '' || 
                article.title.toLowerCase().includes(searchTerm) ||
                article.content.toLowerCase().includes(searchTerm) ||
                (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm))) ||
                (article.summary && article.summary.toLowerCase().includes(searchTerm));

            const matchesCategory = categoryFilter === '' || article.category === categoryFilter;

            const matchesVerified = verifiedFilter === '' ||
                (verifiedFilter === 'verified' && article.isVerified) ||
                (verifiedFilter === 'unverified' && !article.isVerified);

            return matchesSearch && matchesCategory && matchesVerified;
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
                case 'most-used': return (b.usageCount || 0) - (a.usageCount || 0);
                case 'title': return a.title.localeCompare(b.title);
                case 'newest':
                default: return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        const container = document.getElementById('knowledge-grid');
        if (!container) return;

        if (filtered.length === 0) {
            container.innerHTML = '<div class="no-results">🔍 No articles match your search criteria</div>';
            return;
        }

        container.innerHTML = '';
        filtered.forEach(article => {
            const date = new Date(article.createdAt).toLocaleDateString();
            const tags = article.tags || [];
            const tagsHtml = tags.length > 0 
                ? `<div class="knowledge-tags">${tags.map(tag => `<span class="knowledge-tag">#${tag}</span>`).join('')}</div>` 
                : '';
            const summaryHtml = article.summary 
                ? `<p class="knowledge-summary">${highlightText(article.summary, searchTerm)}</p>` 
                : '';
            const verifiedBadge = article.isVerified 
                ? `<div class="verified-badge">✅ Verified</div>` 
                : '';
            const usageBadge = article.usageCount > 0 
                ? `<div class="knowledge-usage-badge">🔥 Used ${article.usageCount}x by AI</div>` 
                : '';
            
            const card = document.createElement('div');
            card.className = 'card knowledge-card';
            card.innerHTML = `
                ${verifiedBadge}
                <button class="delete-btn" onclick="event.stopPropagation(); deleteKnowledge('${article._id}')">Delete</button>
                <h4>${highlightText(article.title, searchTerm)}</h4>
                <p class="meta">${article.category} • ${date}</p>
                ${tagsHtml}
                ${summaryHtml}
                ${usageBadge}
            `;
            card.addEventListener('click', () => openArticleView(article));
            container.appendChild(card);
        });
    }

    function highlightText(text, searchTerm) {
        if (!searchTerm || !text) return text;
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    document.getElementById('knowledge-search')?.addEventListener('input', renderFilteredKnowledge);
    document.getElementById('knowledge-category-filter')?.addEventListener('change', renderFilteredKnowledge);
    document.getElementById('knowledge-verified-filter')?.addEventListener('change', renderFilteredKnowledge);
    document.getElementById('knowledge-sort')?.addEventListener('change', renderFilteredKnowledge);

    async function loadKnowledgeInsights() {
        try {
            const response = await fetch(`${API_URL}/knowledge/insights`);
            const result = await response.json();
            if (result.success) {
                animateCounter('insight-total', result.data.totalArticles);
                animateCounter('insight-verified', result.data.verifiedArticles);
                animateCounter('insight-usage', result.data.totalUsage);
            }
        } catch (error) { console.error('❌ Error loading insights:', error); }
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
                container.innerHTML = '<p class="empty-state">No communications yet. Post your first announcement!</p>';
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

    function openArticleView(article) {
        currentViewArticleId = article._id;
        const date = new Date(article.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        document.getElementById('view-article-title').textContent = article.title;
        document.getElementById('view-article-category').textContent = article.category;
        document.getElementById('view-article-date').textContent = `Published: ${date}`;
        document.getElementById('view-article-content').textContent = article.content;
        
        const summaryBox = document.getElementById('view-article-summary');
        if (article.summary) {
            summaryBox.textContent = article.summary;
            summaryBox.style.display = 'block';
        } else {
            summaryBox.style.display = 'none';
        }
        
        const tagsBox = document.getElementById('view-article-tags');
        const tags = article.tags || [];
        if (tags.length > 0) {
            tagsBox.innerHTML = tags.map(tag => `<span class="knowledge-tag">#${tag}</span>`).join('');
            tagsBox.style.display = 'flex';
        } else {
            tagsBox.style.display = 'none';
        }
        
        const usageBox = document.getElementById('view-article-usage');
        if (article.usageCount > 0) {
            usageBox.textContent = `🔥 Referenced ${article.usageCount} times by AI`;
            usageBox.style.display = 'inline-flex';
        } else {
            usageBox.style.display = 'none';
        }
        
        const verifiedBox = document.getElementById('view-article-verified-badge');
        if (article.isVerified) {
            verifiedBox.innerHTML = '<div class="article-verified-box">✅ Verified by King Solomon — Absolute Truth</div>';
        } else {
            verifiedBox.innerHTML = '';
        }
        
        const toggleBtn = document.getElementById('toggle-verify-btn');
        if (toggleBtn) {
            toggleBtn.textContent = article.isVerified ? '❌ Unverify' : '✅ Mark as Verified';
        }
        
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
                alert('✅ Deleted!'); 
                viewModal.style.display = 'none'; 
                currentViewArticleId = null;
                loadKnowledge(); 
                loadKnowledgeInsights();
                loadStats();
                await createLog(userName, 'Deleted a knowledge article', 'Success');
            }
        } catch (error) { console.error('❌ Error:', error); }
    });

    document.getElementById('toggle-verify-btn')?.addEventListener('click', async () => {
        if (!currentViewArticleId) return;
        
        try {
            const getRes = await fetch(`${API_URL}/knowledge`);
            const getResult = await getRes.json();
            const article = getResult.data.find(a => a._id === currentViewArticleId);
            
            if (!article) {
                alert('❌ Article not found');
                return;
            }
            
            const newVerifiedState = !article.isVerified;
            
            const res = await fetch(`${API_URL}/knowledge/${currentViewArticleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isVerified: newVerifiedState })
            });
            const result = await res.json();
            
            if (result.success) {
                const statusText = newVerifiedState ? '✅ Verified as Absolute Truth' : '❌ Unverified';
                alert(statusText);
                openArticleView(result.data);
                loadKnowledge();
                loadKnowledgeInsights();
                await createLog(userName, `${newVerifiedState ? 'Verified' : 'Unverified'} knowledge article: "${article.title}"`, 'Success');
            } else {
                alert('❌ ' + result.message);
            }
        } catch (error) { 
            console.error('❌ Error:', error); 
            alert('❌ Network error');
        }
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
                container.innerHTML = '<p class="empty-state">No activity logs yet.</p>';
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

    // ========================================
    // AGENT MEMORY SYSTEM
    // ========================================
    async function loadMemoryStats() {
        try {
            const response = await fetch(`${API_URL}/memories/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            
            if (result.success) {
                memoryStats = {};
                result.data.forEach(stat => {
                    memoryStats[stat._id] = stat;
                });
            }
        } catch (error) {
            console.error('❌ Error loading memory stats:', error);
        }
    }

    async function loadAgentMemories(agentId) {
        try {
            const response = await fetch(`${API_URL}/memories/agent/${agentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            return result.success ? result.data : [];
        } catch (error) {
            console.error('❌ Error loading agent memories:', error);
            return [];
        }
    }

    function getMemoryLevel(totalMemories) {
        if (totalMemories >= 30) return { level: 'Expert', class: 'expert' };
        if (totalMemories >= 16) return { level: 'Advanced', class: 'advanced' };
        if (totalMemories >= 6) return { level: 'Experienced', class: 'experienced' };
        return { level: 'Novice', class: 'novice' };
    }

    function renderMemoryIndicator(agent) {
        const stats = memoryStats[agent._id];
        const totalMemories = stats ? stats.totalMemories : 0;
        const { level, class: levelClass } = getMemoryLevel(totalMemories);
        
        return `
            <div class="memory-indicator" onclick="openAgentMemory('${agent._id}', '${agent.name}', event)">
                <span class="memory-icon">🧠</span>
                <span class="memory-count">${totalMemories} memories</span>
                <span class="memory-level ${levelClass}">${level}</span>
            </div>
        `;
    }

    window.openAgentMemory = async (agentId, agentName, event) => {
        if (event) event.stopPropagation();
        
        const modal = document.getElementById('agent-memory-modal');
        document.getElementById('memory-agent-name').textContent = agentName;
        
        const statsContainer = document.getElementById('memory-agent-stats');
        const listContainer = document.getElementById('memory-list');
        
        statsContainer.innerHTML = '<div class="task-loading"><div class="task-loading-spinner"></div></div>';
        listContainer.innerHTML = '<div class="task-loading"><div class="task-loading-spinner"></div></div>';
        
        modal.style.display = 'block';
        
        const stats = memoryStats[agentId];
        if (stats) {
            const { level, class: levelClass } = getMemoryLevel(stats.totalMemories);
            const successRate = stats.totalMemories > 0 
                ? Math.round((stats.completedTasks / stats.totalMemories) * 100) 
                : 0;
            
            statsContainer.innerHTML = `
                <div class="memory-stat"><div class="memory-stat-value">${stats.totalMemories}</div><div class="memory-stat-label">Total Memories</div></div>
                <div class="memory-stat"><div class="memory-stat-value">${successRate}%</div><div class="memory-stat-label">Success Rate</div></div>
                <div class="memory-stat"><div class="memory-stat-value memory-level ${levelClass}" style="padding: 8px 12px; font-size: 1rem;">${level}</div><div class="memory-stat-label">Experience Level</div></div>
            `;
        } else {
            statsContainer.innerHTML = `
                <div class="memory-stat"><div class="memory-stat-value">0</div><div class="memory-stat-label">Total Memories</div></div>
                <div class="memory-stat"><div class="memory-stat-value">0%</div><div class="memory-stat-label">Success Rate</div></div>
                <div class="memory-stat"><div class="memory-stat-value memory-level novice" style="padding: 8px 12px; font-size: 1rem;">Novice</div><div class="memory-stat-label">Experience Level</div></div>
            `;
        }
        
        const memories = await loadAgentMemories(agentId);
        
        if (memories.length > 0) {
            listContainer.innerHTML = '';
            memories.forEach(memory => {
                const item = document.createElement('div');
                item.className = 'memory-item';
                const date = new Date(memory.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                item.innerHTML = `
                    <div class="memory-item-header">
                        <div class="memory-item-title">${memory.taskTitle}</div>
                        <div class="memory-item-badges">
                            <span class="memory-status-badge ${memory.status.toLowerCase()}">${memory.status}</span>
                            <span class="memory-category-badge">${memory.category}</span>
                        </div>
                    </div>
                    <div class="memory-item-description">${memory.taskDescription}</div>
                    <div class="memory-item-footer">
                        <div class="memory-keywords">
                            ${memory.keywords.slice(0, 5).map(k => `<span class="memory-keyword">${k}</span>`).join('')}
                        </div>
                        <div class="memory-date">${date}</div>
                    </div>
                `;
                listContainer.appendChild(item);
            });
        } else {
            listContainer.innerHTML = `<div class="memory-empty"><div class="memory-empty-icon">🧠</div><p>No memories yet. Assign tasks to build experience!</p></div>`;
        }
        
        modal.dataset.currentAgentId = agentId;
    };

    document.getElementById('close-memory-modal')?.addEventListener('click', () => {
        document.getElementById('agent-memory-modal').style.display = 'none';
    });

    document.getElementById('close-memory-btn')?.addEventListener('click', () => {
        document.getElementById('agent-memory-modal').style.display = 'none';
    });

    document.getElementById('clear-agent-memories-btn')?.addEventListener('click', async () => {
        const modal = document.getElementById('agent-memory-modal');
        const agentId = modal.dataset.currentAgentId;
        const agentName = document.getElementById('memory-agent-name').textContent;
        
        if (!confirm(`Clear ALL memories for ${agentName}? This cannot be undone!`)) return;
        
        try {
            const response = await fetch(`${API_URL}/memories/agent/${agentId}/clear`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            
            if (result.success) {
                alert(`✅ Cleared ${result.data.deletedCount} memories for ${agentName}`);
                modal.style.display = 'none';
                await loadMemoryStats();
                loadAgents();
                await createLog(userName, `Cleared memories for ${agentName}`, 'Success');
            }
        } catch (error) {
            console.error('❌ Error clearing memories:', error);
            alert('❌ Failed to clear memories');
        }
    });

    // ========================================
    // TASK ASSIGNMENT SYSTEM
    // ========================================
    let currentTaskAgent = null;

    async function openTaskModal(agent) {
        currentTaskAgent = agent;
        const modal = document.getElementById('task-modal');
        document.getElementById('task-agent-name').textContent = agent.name;
        
        const agentInfo = document.getElementById('task-agent-info');
        const agentEmoji = getAgentEmoji(agent.role);
        agentInfo.innerHTML = `
            <div class="agent-avatar">${agentEmoji}</div>
            <div class="agent-details">
                <h4>${agent.name}</h4>
                <p>${agent.role} • Status: ${agent.status}</p>
            </div>
        `;

        const memoryPreview = document.getElementById('agent-memory-preview');
        const stats = memoryStats[agent._id];
        const totalMemories = stats ? stats.totalMemories : 0;
        const { level, class: levelClass } = getMemoryLevel(totalMemories);
        
        memoryPreview.innerHTML = `
            <div class="memory-preview-header">
                <h5>🧠 Agent Memory</h5>
                <span class="memory-preview-count">${totalMemories} memories • <span class="memory-level ${levelClass}" style="padding: 2px 8px;">${level}</span></span>
            </div>
            <div class="memory-preview-list" id="memory-preview-list">
                <div class="memory-preview-item"><div class="memory-title">Loading recent memories...</div></div>
            </div>
        `;

        const memories = await loadAgentMemories(agent._id);
        const previewList = document.getElementById('memory-preview-list');
        
        if (memories.length > 0) {
            previewList.innerHTML = '';
            memories.slice(0, 3).forEach(memory => {
                const item = document.createElement('div');
                item.className = 'memory-preview-item';
                const date = new Date(memory.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                item.innerHTML = `
                    <div class="memory-title">${memory.status === 'Completed' ? '✅' : '❌'} ${memory.taskTitle}</div>
                    <div class="memory-date">${date} • ${memory.category}</div>
                `;
                previewList.appendChild(item);
            });
        } else {
            previewList.innerHTML = '<div class="memory-preview-item"><div class="memory-title">No memories yet - fresh agent!</div></div>';
        }

        loadTaskExamples(agent.role);

        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        document.getElementById('task-priority').value = 'Medium';

        modal.style.display = 'block';
    }

    function getAgentEmoji(role) {
        const roleLower = role.toLowerCase();
        if (roleLower.includes('operations') || roleLower.includes('coordinator')) return '⚙️';
        if (roleLower.includes('knowledge') || roleLower.includes('librarian')) return '📚';
        if (roleLower.includes('builder') || roleLower.includes('engineer')) return '🔨';
        return '🤖';
    }

    function loadTaskExamples(role) {
        const examplesContainer = document.getElementById('task-examples');
        const roleLower = role.toLowerCase();
        let examples = [];

        if (roleLower.includes('operations') || roleLower.includes('coordinator')) {
            examples = ['Schedule a dev team meeting', 'Coordinate project timeline', 'Optimize workflow process', 'Allocate resources for ShineGPT', 'Plan sprint for KS1 Wallet'];
        } else if (roleLower.includes('knowledge') || roleLower.includes('librarian')) {
            examples = ['Research blockchain trends 2026', 'Analyze AI market opportunities', 'Compile Web3 documentation', 'Research African fintech landscape', 'Study DeFi protocols'];
        } else if (roleLower.includes('builder') || roleLower.includes('engineer')) {
            examples = ['Design wallet smart contract', 'Build landing page for ShineGPT', 'Implement payment API', 'Fix authentication bug', 'Create database schema'];
        } else {
            examples = ['Analyze current project status', 'Propose new feature ideas', 'Review documentation', 'Create action plan'];
        }

        examplesContainer.innerHTML = '';
        examples.forEach(example => {
            const chip = document.createElement('span');
            chip.className = 'example-chip';
            chip.textContent = example;
            chip.addEventListener('click', () => {
                document.getElementById('task-title').value = example;
                document.getElementById('task-description').value = `Please execute this task: ${example}. Provide a detailed report with actionable outcomes.`;
            });
            examplesContainer.appendChild(chip);
        });
    }

    const taskModal = document.getElementById('task-modal');
    document.getElementById('close-task-modal')?.addEventListener('click', () => {
        taskModal.style.display = 'none';
        currentTaskAgent = null;
    });
    document.getElementById('cancel-task-btn')?.addEventListener('click', () => {
        taskModal.style.display = 'none';
        currentTaskAgent = null;
    });

    document.getElementById('submit-task-btn')?.addEventListener('click', async () => {
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const priority = document.getElementById('task-priority').value;
        const submitBtn = document.getElementById('submit-task-btn');

        if (!title || !description) {
            alert('Please fill in task title and description');
            return;
        }

        if (!currentTaskAgent) {
            alert('No agent selected');
            return;
        }

        submitBtn.textContent = '🚀 Executing...';
        submitBtn.disabled = true;

        try {
            const response = await fetch(`${API_URL}/tasks`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    assignedAgent: currentTaskAgent._id,
                    priority
                })
            });

            const result = await response.json();

            if (result.success) {
                taskModal.style.display = 'none';
                currentTaskAgent = null;
                
                showTaskResult(result.data, result.memoryUsed || 0);
                
                await loadMemoryStats();
                loadTasks();
                loadAgents();
                loadStats();
                loadActivityLog();
                
                const memoryMsg = result.memoryUsed > 0 
                    ? ` (referenced ${result.memoryUsed} past memories!)` 
                    : '';
                alert(`✅ Task assigned to ${result.data.agentName} and executed${memoryMsg}`);
            } else {
                alert('❌ ' + result.message);
            }
        } catch (error) {
            console.error('❌ Error creating task:', error);
            alert('❌ Network error. Please try again.');
        } finally {
            submitBtn.textContent = '🚀 Execute Task';
            submitBtn.disabled = false;
        }
    });

    async function loadTasks() {
        const container = document.getElementById('task-queue');
        if (!container) return;

        container.innerHTML = '<div class="task-loading"><div class="task-loading-spinner"></div><p>Loading tasks...</p></div>';

        try {
            const response = await fetch(`${API_URL}/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();

            if (result.success && result.data.length > 0) {
                container.innerHTML = '';
                result.data.forEach(task => {
                    const taskItem = createTaskItem(task);
                    container.appendChild(taskItem);
                });
            } else {
                container.innerHTML = '<p class="empty-state">No tasks yet. Click on an AI agent above to assign your first task!</p>';
            }
        } catch (error) {
            console.error('❌ Error loading tasks:', error);
            container.innerHTML = '<p class="empty-state">Error loading tasks. Please refresh.</p>';
        }
    }

    function createTaskItem(task) {
        const item = document.createElement('div');
        item.className = 'task-item';
        
        const statusClass = task.status.toLowerCase().replace(' ', '-');
        const priorityClass = task.priority.toLowerCase();
        const createdDate = new Date(task.createdAt).toLocaleString();
        const agentEmoji = getAgentEmoji(task.agentRole);
        
        item.innerHTML = `
            <div class="task-item-header">
                <div class="task-item-title">${task.title}</div>
                <div class="task-item-badges">
                    <span class="task-status-badge ${statusClass}">${task.status}</span>
                    <span class="task-priority-badge ${priorityClass}">${task.priority}</span>
                </div>
            </div>
            <div class="task-item-description">${task.description}</div>
            <div class="task-item-meta">
                <span>${agentEmoji} <span class="task-agent-name">${task.agentName}</span> • ${createdDate}</span>
                <div class="task-actions">
                    ${task.result ? `<button class="task-action-btn" onclick="viewTaskResult('${task._id}')">📋 View Result</button>` : ''}
                    <button class="task-action-btn delete" onclick="deleteTask('${task._id}')">🗑️ Delete</button>
                </div>
            </div>
        `;
        
        return item;
    }

    window.viewTaskResult = async (taskId) => {
        try {
            const response = await fetch(`${API_URL}/tasks`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            
            if (result.success) {
                const task = result.data.find(t => t._id === taskId);
                if (task) {
                    showTaskResult(task, 0);
                }
            }
        } catch (error) {
            console.error('❌ Error loading task result:', error);
        }
    };

    function showTaskResult(task, memoryUsed = 0) {
        const modal = document.getElementById('task-result-modal');
        const content = document.getElementById('task-result-content');
        
        const statusClass = task.status.toLowerCase().replace(' ', '-');
        const createdDate = new Date(task.createdAt).toLocaleString();
        const completedDate = task.completedAt ? new Date(task.completedAt).toLocaleString() : 'In progress';
        
        const memoryIndicator = memoryUsed > 0 
            ? `<div class="memory-used-indicator"><span class="memory-used-icon">🧠</span><span>Agent referenced <strong>${memoryUsed}</strong> past memories</span></div>`
            : '';
        
        content.innerHTML = `
            <div class="task-result-header">
                <h4>${task.title}</h4>
                <p>🤖 ${task.agentName} • ${task.agentRole}</p>
                <p style="margin-top: 8px; font-size: 0.8rem;">Created: ${createdDate} | Completed: ${completedDate}</p>
                <p style="margin-top: 5px;">
                    <span class="task-status-badge ${statusClass}">${task.status}</span>
                    <span class="task-priority-badge ${task.priority.toLowerCase()}">${task.priority}</span>
                </p>
            </div>
            ${memoryIndicator}
            <div style="margin-top: 15px;">
                <h4 style="color: var(--gold); margin-bottom: 10px;">📋 Task Description:</h4>
                <p style="color: rgba(255,255,255,0.8); margin-bottom: 20px;">${task.description}</p>
                <h4 style="color: var(--gold); margin-bottom: 10px;">✅ Agent's Report:</h4>
                <div style="color: rgba(255,255,255,0.9); line-height: 1.7; white-space: pre-wrap;">${task.result || 'No result yet'}</div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    document.getElementById('close-task-result-modal')?.addEventListener('click', () => {
        document.getElementById('task-result-modal').style.display = 'none';
    });
    document.getElementById('close-result-btn')?.addEventListener('click', () => {
        document.getElementById('task-result-modal').style.display = 'none';
    });

    window.deleteTask = async (taskId) => {
        if (!confirm('Delete this task?')) return;
        try {
            const response = await fetch(`${API_URL}/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            if (result.success) {
                loadTasks();
                loadStats();
                await createLog(userName, 'Deleted a task', 'Success');
            }
        } catch (error) {
            console.error('❌ Error deleting task:', error);
        }
    };

    document.getElementById('refresh-tasks-btn')?.addEventListener('click', () => {
        loadTasks();
    });
        // ========================================
    // CONVERSATION HISTORY
    // ========================================
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
                
                const titleDisplay = document.getElementById('current-conversation-title');
                const titleText = document.getElementById('current-title-text');
                if (titleDisplay && titleText) {
                    titleText.textContent = result.data.title;
                    titleDisplay.classList.remove('hidden');
                }
                
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

    // ========================================
    // AI CHAT
    // ========================================
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
                
                if (result.data.conversationId && !currentConversationId) {
                    currentConversationId = result.data.conversationId;
                    
                    const titleDisplay = document.getElementById('current-conversation-title');
                    const titleText = document.getElementById('current-title-text');
                    if (titleDisplay && titleText && result.data.conversationTitle) {
                        titleText.textContent = result.data.conversationTitle;
                        titleDisplay.classList.remove('hidden');
                    }
                    
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

    // ========================================
    // DELETE FUNCTIONS
    // ========================================
    window.deleteProject = async (id) => {
        if (!confirm('Delete this project?')) return;
        try {
            const res = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) { 
                alert('✅ Project deleted!'); 
                loadProjects(); 
                loadStats();
                await createLog(userName, 'Deleted a project', 'Success'); 
                setTimeout(renderCharts, 300); 
            }
        } catch (error) { console.error('❌ Error:', error); }
    };

    window.deleteKnowledge = async (id) => {
        if (!confirm('Delete this knowledge article?')) return;
        try {
            const res = await fetch(`${API_URL}/knowledge/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) { 
                alert('✅ Article deleted!'); 
                loadKnowledge(); 
                loadKnowledgeInsights();
                loadStats();
                await createLog(userName, 'Deleted a knowledge article', 'Success'); 
            }
        } catch (error) { console.error('❌ Error:', error); }
    };

    window.deleteCommunication = async (id) => {
        if (!confirm('Delete this announcement?')) return;
        try {
            const res = await fetch(`${API_URL}/communications/${id}`, { method: 'DELETE' });
            const result = await res.json();
            if (result.success) { 
                alert('✅ Announcement deleted!'); 
                loadCommunications(); 
                loadStats();
                await createLog(userName, 'Deleted an announcement', 'Success'); 
                setTimeout(renderCharts, 300); 
            }
        } catch (error) { console.error('❌ Error:', error); }
    };

    // ========================================
    // EXPORT FUNCTIONS
    // ========================================
    async function downloadCSV(endpoint, filename) {
        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                throw new Error('Export failed');
            }
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            await createLog(userName, `Exported ${filename}`, 'Success');
        } catch (error) {
            console.error('❌ Export error:', error);
            alert('❌ Export failed. Please try again.');
        }
    }

    document.getElementById('export-projects-btn')?.addEventListener('click', () => {
        downloadCSV('/export/projects', `ks1-projects-${Date.now()}.csv`);
    });

    document.getElementById('export-agents-btn')?.addEventListener('click', () => {
        downloadCSV('/export/agents', `ks1-agents-${Date.now()}.csv`);
    });

    document.getElementById('export-knowledge-btn')?.addEventListener('click', () => {
        downloadCSV('/export/knowledge', `ks1-knowledge-${Date.now()}.csv`);
    });

    document.getElementById('export-communications-btn')?.addEventListener('click', () => {
        downloadCSV('/export/communications', `ks1-communications-${Date.now()}.csv`);
    });

    document.getElementById('export-tasks-btn')?.addEventListener('click', () => {
        downloadCSV('/export/tasks', `ks1-tasks-${Date.now()}.csv`);
    });

    document.getElementById('export-logs-btn')?.addEventListener('click', () => {
        downloadCSV('/export/activity-logs', `ks1-activity-logs-${Date.now()}.csv`);
    });

    document.getElementById('export-all-csv-btn')?.addEventListener('click', async () => {
        try {
            await downloadCSV('/export/projects', `ks1-projects-${Date.now()}.csv`);
            await new Promise(resolve => setTimeout(resolve, 500));
            await downloadCSV('/export/agents', `ks1-agents-${Date.now()}.csv`);
            await new Promise(resolve => setTimeout(resolve, 500));
            await downloadCSV('/export/knowledge', `ks1-knowledge-${Date.now()}.csv`);
            await new Promise(resolve => setTimeout(resolve, 500));
            await downloadCSV('/export/communications', `ks1-communications-${Date.now()}.csv`);
            await new Promise(resolve => setTimeout(resolve, 500));
            await downloadCSV('/export/tasks', `ks1-tasks-${Date.now()}.csv`);
            await new Promise(resolve => setTimeout(resolve, 500));
            await downloadCSV('/export/activity-logs', `ks1-activity-logs-${Date.now()}.csv`);
            
            alert('✅ All data exported successfully!');
        } catch (error) {
            console.error('❌ Export all error:', error);
            alert('❌ Export failed. Please try again.');
        }
    });

    document.getElementById('export-all-pdf-btn')?.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_URL}/export/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            
            if (!result.success) {
                throw new Error('Failed to fetch data');
            }
            
            const data = result.data;
            
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            doc.setFontSize(20);
            doc.setTextColor(212, 175, 55);
            doc.text('KS1 Command Center Report', 105, 20, { align: 'center' });
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated: ${new Date(data.generatedAt).toLocaleString()}`, 105, 30, { align: 'center' });
            
            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text('Summary', 20, 45);
            
            doc.setFontSize(10);
            doc.text(`Total Projects: ${data.summary.totalProjects}`, 20, 55);
            doc.text(`Total Agents: ${data.summary.totalAgents}`, 20, 62);
            doc.text(`Total Knowledge Articles: ${data.summary.totalKnowledge}`, 20, 69);
            doc.text(`Total Communications: ${data.summary.totalCommunications}`, 20, 76);
            doc.text(`Total Tasks: ${data.summary.totalTasks}`, 20, 83);
            doc.text(`Total Activities: ${data.summary.totalActivities}`, 20, 90);
            
            let yPos = 105;
            doc.setFontSize(14);
            doc.text('Projects', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(9);
            data.projects.forEach(project => {
                if (yPos > 270) { doc.addPage(); yPos = 20; }
                doc.text(`• ${project.name} (${project.status})`, 25, yPos);
                yPos += 5;
                const descLines = doc.splitTextToSize(project.description, 160);
                doc.text(descLines, 30, yPos);
                yPos += descLines.length * 5 + 3;
            });
            
            yPos += 10;
            if (yPos > 250) { doc.addPage(); yPos = 20; }
            doc.setFontSize(14);
            doc.text('AI Agents', 20, yPos);
            yPos += 10;
            
            doc.setFontSize(9);
            data.agents.forEach(agent => {
                if (yPos > 270) { doc.addPage(); yPos = 20; }
                doc.text(`• ${agent.name} - ${agent.role} (${agent.status})`, 25, yPos);
                yPos += 7;
            });
            
            doc.save(`ks1-command-center-report-${Date.now()}.pdf`);
            
            await createLog(userName, 'Generated PDF report', 'Success');
            alert('✅ PDF report generated successfully!');
        } catch (error) {
            console.error('❌ PDF export error:', error);
            alert('❌ PDF generation failed. Please try again.');
        }
    });

    // ========================================
    // MODAL LOGIC
    // ========================================
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
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '✨ Enriching...';
            submitBtn.disabled = true;
            try {
                const res = await fetch(`${API_URL}${endpoint}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.success) {
                    alert(`✅ ${successMsg}`); 
                    modal.style.display = 'none'; 
                    clearFn();
                    reloadFn(); 
                    loadKnowledgeInsights();
                    loadStats();
                    await createLog(userName, `Added knowledge: "${payload.title}"`, 'Success');
                } else { 
                    alert('❌ ' + result.message); 
                }
            } catch (error) { 
                alert('❌ Network error.'); 
            } finally { 
                submitBtn.textContent = originalText || btnLabel;
                submitBtn.disabled = false; 
            }
        });
    };

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
        }, 'Knowledge article saved and enriched by AI!', loadKnowledge, '✨ Save & Enrich',
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

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
            if (e.target.id === 'project-modal') { document.getElementById('project-name').value = ''; document.getElementById('project-description').value = ''; }
            if (e.target.id === 'knowledge-modal') { document.getElementById('knowledge-title').value = ''; document.getElementById('knowledge-content').value = ''; }
            if (e.target.id === 'communication-modal') { 
                document.getElementById('communication-title').value = ''; 
                document.getElementById('communication-content').value = '';
                document.getElementById('communication-category').value = 'Announcement';
                document.getElementById('communication-priority').value = 'Normal';
            }
            if (e.target.id === 'knowledge-view-modal') { currentViewArticleId = null; }
            if (e.target.id === 'task-modal') { currentTaskAgent = null; }
        }
    });

    console.log('✅ KS1 Command Center initialized successfully');
});
