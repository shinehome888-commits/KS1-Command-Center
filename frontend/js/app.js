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

    console.log('🚀 KS1 Command Center initializing...');

    loadAgents();
    loadProjects();
    loadKnowledge();
    loadActivityLog();

    // --- LOAD AGENTS ---
    async function loadAgents() {
        try {
            const response = await fetch(`${API_URL}/agents`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const container = document.getElementById('agents-grid');
                container.innerHTML = '';
                
                result.data.forEach(agent => {
                    const statusClass = agent.status.toLowerCase();
                    const card = document.createElement('div');
                    card.className = 'card agent-card';
                    card.innerHTML = `
                        <button class="delete-btn" onclick="deleteAgent('${agent._id}')">Delete</button>
                        <div class="status-indicator ${statusClass}"></div>
                        <h4>${agent.name}</h4>
                        <p class="role">${agent.role}</p>
                        <span class="status-text">${agent.status}</span>
                    `;
                    container.appendChild(card);
                });
                console.log('✅ Agents loaded successfully');
            }
        } catch (error) { console.error('❌ Error loading agents:', error); }
    }

    // --- LOAD PROJECTS ---
    async function loadProjects() {
        try {
            const response = await fetch(`${API_URL}/projects`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const container = document.getElementById('projects-grid');
                container.innerHTML = '';
                
                result.data.forEach(project => {
                    const badgeClass = project.status.toLowerCase();
                    const card = document.createElement('div');
                    card.className = 'card project-card';
                    card.innerHTML = `
                        <button class="delete-btn" onclick="deleteProject('${project._id}')">Delete</button>
                        <h4>${project.name}</h4>
                        <p class="description">${project.description}</p>
                        <p class="category">Category: ${project.category}</p>
                        <span class="badge ${badgeClass}">${project.status}</span>
                    `;
                    container.appendChild(card);
                });
                console.log('✅ Projects loaded successfully');
            }
        } catch (error) { console.error('❌ Error loading projects:', error); }
    }

    // --- LOAD KNOWLEDGE (WITH CLICK TO VIEW) ---
    async function loadKnowledge() {
        try {
            const response = await fetch(`${API_URL}/knowledge`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const container = document.getElementById('knowledge-grid');
                container.innerHTML = '';
                
                result.data.forEach(article => {
                    const date = new Date(article.createdAt).toLocaleDateString();
                    const snippet = article.content.substring(0, 120) + (article.content.length > 120 ? '...' : '');
                    const card = document.createElement('div');
                    card.className = 'card knowledge-card';
                    card.innerHTML = `
                        <button class="delete-btn" onclick="event.stopPropagation(); deleteKnowledge('${article._id}')">Delete</button>
                        <h4>${article.title}</h4>
                        <p class="meta">${article.category} • ${date}</p>
                        <p class="snippet">${snippet}</p>
                    `;
                    
                    card.addEventListener('click', () => {
                        openArticleView(article);
                    });
                    
                    container.appendChild(card);
                });
                console.log('✅ Knowledge loaded successfully');
            }
        } catch (error) { console.error('❌ Error loading knowledge:', error); }
    }

    // --- VIEW FULL ARTICLE IN MODAL ---
    let currentViewArticleId = null;
    
    function openArticleView(article) {
        currentViewArticleId = article._id;
        const date = new Date(article.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        document.getElementById('view-article-title').textContent = article.title;
        document.getElementById('view-article-category').textContent = article.category;
        document.getElementById('view-article-date').textContent = `Published: ${date}`;
        document.getElementById('view-article-content').textContent = article.content;
        
        document.getElementById('knowledge-view-modal').style.display = 'block';
    }
    
    const viewModal = document.getElementById('knowledge-view-modal');
    const closeViewModalBtn = document.getElementById('close-view-modal');
    const closeViewBtn = document.getElementById('close-view-btn');
    const deleteViewArticleBtn = document.getElementById('delete-view-article-btn');
    
    function closeViewModal() {
        viewModal.style.display = 'none';
        currentViewArticleId = null;
    }
    
    if (closeViewModalBtn) closeViewModalBtn.addEventListener('click', closeViewModal);
    if (closeViewBtn) closeViewBtn.addEventListener('click', closeViewModal);
    
    if (deleteViewArticleBtn) {
        deleteViewArticleBtn.addEventListener('click', async () => {
            if (!currentViewArticleId) return;
            if (!confirm('Are you sure you want to delete this knowledge article?')) return;
            
            try {
                const response = await fetch(`${API_URL}/knowledge/${currentViewArticleId}`, { 
                    method: 'DELETE' 
                });
                const result = await response.json();
                
                if (result.success) {
                    alert('✅ Knowledge article deleted successfully!');
                    closeViewModal();
                    loadKnowledge();
                    await createLog('King Solomon', 'Deleted a knowledge article', 'Success');
                } else {
                    alert('❌ Error: ' + result.message);
                }
            } catch (error) {
                console.error('❌ Error deleting knowledge:', error);
                alert('❌ Network error. Please try again.');
            }
        });
    }

    // --- LOAD ACTIVITY LOG ---
    async function loadActivityLog() {
        try {
            const response = await fetch(`${API_URL}/logs`);
            const result = await response.json();
            
            const container = document.getElementById('activity-log');
            container.innerHTML = '';
            
            if (result.success && result.data.length > 0) {
                result.data.forEach(log => {
                    const timestamp = new Date(log.createdAt).toLocaleString();
                    const logItem = document.createElement('div');
                    logItem.className = 'log-item';
                    logItem.innerHTML = `
                        <div class="log-details">
                            <strong class="log-actor">${log.actor}</strong>
                            <span class="log-action">${log.action}</span>
                        </div>
                        <div class="log-meta">
                            <span class="badge-log">${log.status}</span>
                            <span class="log-time">${timestamp}</span>
                        </div>
                    `;
                    container.appendChild(logItem);
                });
                console.log('✅ Activity log loaded successfully');
            } else {
                container.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No activity logs yet.</p>';
            }
        } catch (error) { console.error('❌ Error loading activity log:', error); }
    }

    // --- CREATE ACTIVITY LOG ---
    async function createLog(actor, action, status = 'Success') {
        try {
            await fetch(`${API_URL}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actor, action, status })
            });
            loadActivityLog();
        } catch (error) { console.error('❌ Error creating log:', error); }
    }

    // ========================================
    // AGENT MODAL LOGIC
    // ========================================
    const agentModal = document.getElementById('agent-modal');
    const addAgentBtn = document.getElementById('add-agent-btn');
    const closeAgentModalBtn = document.getElementById('close-agent-modal');
    const cancelAgentBtn = document.getElementById('cancel-agent-btn');
    const submitAgentBtn = document.getElementById('submit-agent-btn');

    if (addAgentBtn) addAgentBtn.addEventListener('click', () => agentModal.style.display = 'block');
    if (closeAgentModalBtn) closeAgentModalBtn.addEventListener('click', () => { agentModal.style.display = 'none'; clearAgentForm(); });
    if (cancelAgentBtn) cancelAgentBtn.addEventListener('click', () => { agentModal.style.display = 'none'; clearAgentForm(); });

    function clearAgentForm() {
        document.getElementById('agent-name').value = '';
        document.getElementById('agent-role').value = '';
    }

    if (submitAgentBtn) {
        submitAgentBtn.addEventListener('click', async () => {
            const name = document.getElementById('agent-name').value.trim();
            const role = document.getElementById('agent-role').value.trim();
            const status = document.getElementById('agent-status').value;

            if (!name || !role) { alert('Please fill in all fields'); return; }

            try {
                const response = await fetch(`${API_URL}/agents`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, role, status })
                });
                const result = await response.json();

                if (result.success) {
                    alert('✅ Agent deployed successfully!');
                    agentModal.style.display = 'none';
                    clearAgentForm();
                    loadAgents();
                    await createLog('King Solomon', `Deployed agent: ${name}`, 'Success');
                } else { alert('❌ Error: ' + result.message); }
            } catch (error) {
                console.error('❌ Error deploying agent:', error);
                alert('❌ Network error. Please try again.');
            }
        });
    }

    window.deleteAgent = async (id) => {
        if (!confirm('Are you sure you want to decommission this AI Agent?')) return;
        try {
            const response = await fetch(`${API_URL}/agents/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                alert('✅ Agent decommissioned successfully!');
                loadAgents();
                await createLog('King Solomon', 'Decommissioned an AI Agent', 'Success');
            } else { alert('❌ Error: ' + result.message); }
        } catch (error) {
            console.error('❌ Error deleting agent:', error);
            alert('❌ Network error. Please try again.');
        }
    };

    // ========================================
    // PROJECT MODAL LOGIC
    // ========================================
    const projectModal = document.getElementById('project-modal');
    const addProjectBtn = document.getElementById('add-project-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelProjectBtn = document.getElementById('cancel-project-btn');
    const submitProjectBtn = document.getElementById('submit-project-btn');

    if (addProjectBtn) addProjectBtn.addEventListener('click', () => projectModal.style.display = 'block');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => { projectModal.style.display = 'none'; clearProjectForm(); });
    if (cancelProjectBtn) cancelProjectBtn.addEventListener('click', () => { projectModal.style.display = 'none'; clearProjectForm(); });

    function clearProjectForm() {
        document.getElementById('project-name').value = '';
        document.getElementById('project-description').value = '';
    }

    if (submitProjectBtn) {
        submitProjectBtn.addEventListener('click', async () => {
            const name = document.getElementById('project-name').value.trim();
            const description = document.getElementById('project-description').value.trim();
            const category = document.getElementById('project-category').value;

            if (!name || !description) { alert('Please fill in all fields'); return; }

            try {
                const response = await fetch(`${API_URL}/projects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description, category, status: 'Planning' })
                });
                const result = await response.json();

                if (result.success) {
                    alert('✅ Project created successfully!');
                    projectModal.style.display = 'none';
                    clearProjectForm();
                    loadProjects();
                    await createLog('King Solomon', `Created project: ${name}`, 'Success');
                } else { alert('❌ Error: ' + result.message); }
            } catch (error) {
                console.error('❌ Error creating project:', error);
                alert('❌ Network error. Please try again.');
            }
        });
    }

    window.deleteProject = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            const response = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                alert('✅ Project deleted successfully!');
                loadProjects();
                await createLog('King Solomon', 'Deleted a project', 'Success');
            } else { alert('❌ Error: ' + result.message); }
        } catch (error) {
            console.error('❌ Error deleting project:', error);
            alert('❌ Network error. Please try again.');
        }
    };

    // ========================================
    // KNOWLEDGE MODAL LOGIC
    // ========================================
    const knowledgeModal = document.getElementById('knowledge-modal');
    const addKnowledgeBtn = document.getElementById('add-knowledge-btn');
    const closeKnowledgeModalBtn = document.getElementById('close-knowledge-modal');
    const cancelKnowledgeBtn = document.getElementById('cancel-knowledge-btn');
    const submitKnowledgeBtn = document.getElementById('submit-knowledge-btn');

    if (addKnowledgeBtn) addKnowledgeBtn.addEventListener('click', () => knowledgeModal.style.display = 'block');
    if (closeKnowledgeModalBtn) closeKnowledgeModalBtn.addEventListener('click', () => { knowledgeModal.style.display = 'none'; clearKnowledgeForm(); });
    if (cancelKnowledgeBtn) cancelKnowledgeBtn.addEventListener('click', () => { knowledgeModal.style.display = 'none'; clearKnowledgeForm(); });

    function clearKnowledgeForm() {
        document.getElementById('knowledge-title').value = '';
        document.getElementById('knowledge-content').value = '';
    }

    if (submitKnowledgeBtn) {
        submitKnowledgeBtn.addEventListener('click', async () => {
            const title = document.getElementById('knowledge-title').value.trim();
            const category = document.getElementById('knowledge-category').value;
            const content = document.getElementById('knowledge-content').value.trim();

            if (!title || !content) { alert('Please fill in title and content'); return; }

            try {
                const response = await fetch(`${API_URL}/knowledge`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, category, content })
                });
                const result = await response.json();

                if (result.success) {
                    alert('✅ Knowledge article saved successfully!');
                    knowledgeModal.style.display = 'none';
                    clearKnowledgeForm();
                    loadKnowledge();
                    await createLog('King Solomon', `Added knowledge: ${title}`, 'Success');
                } else { alert('❌ Error: ' + result.message); }
            } catch (error) {
                console.error('❌ Error creating knowledge:', error);
                alert('❌ Network error. Please try again.');
            }
        });
    }

    window.deleteKnowledge = async (id) => {
        if (!confirm('Are you sure you want to delete this knowledge article?')) return;
        try {
            const response = await fetch(`${API_URL}/knowledge/${id}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                alert('✅ Knowledge article deleted successfully!');
                loadKnowledge();
                await createLog('King Solomon', 'Deleted a knowledge article', 'Success');
            } else { alert('❌ Error: ' + result.message); }
        } catch (error) {
            console.error('❌ Error deleting knowledge:', error);
            alert('❌ Network error. Please try again.');
        }
    };

    // ========================================
    // 🧠 REAL AI CHAT LOGIC (DEEPSEEK POWERED)
    // ========================================
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatWindow = document.getElementById('chat-window');

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Show user message immediately
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-message user';
        userDiv.textContent = message;
        chatWindow.appendChild(userDiv);
        chatInput.value = '';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Show "thinking" indicator
        const thinkingDiv = document.createElement('div');
        thinkingDiv.className = 'chat-message bot';
        thinkingDiv.id = 'thinking-indicator';
        thinkingDiv.innerHTML = '<em>🤔 KS1 Assistant is thinking...</em>';
        chatWindow.appendChild(thinkingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Log the user's message
        await createLog('King Solomon', `Sent to AI: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`, 'Success');

        try {
            // Call the real AI backend
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const result = await response.json();

            // Remove thinking indicator
            const thinking = document.getElementById('thinking-indicator');
            if (thinking) thinking.remove();

            // Display AI response
            const botDiv = document.createElement('div');
            botDiv.className = 'chat-message bot';
            
            if (result.success && result.data && result.data.aiResponse) {
                botDiv.textContent = result.data.aiResponse;
                
                // Log the AI response
                await createLog(
                    'KS1 Assistant', 
                    `Responded to: "${message.substring(0, 30)}${message.length > 30 ? '...' : ''}"`, 
                    'Success'
                );
            } else {
                botDiv.textContent = "I'm having a moment, King Solomon. Please try again.";
                await createLog('KS1 Assistant', 'Failed to respond', 'Failed');
            }
            
            chatWindow.appendChild(botDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            
        } catch (error) {
            console.error('❌ AI Chat error:', error);
            
            // Remove thinking indicator
            const thinking = document.getElementById('thinking-indicator');
            if (thinking) thinking.remove();
            
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chat-message bot';
            errorDiv.textContent = "❌ Network error. Please check your connection and try again, King Solomon.";
            chatWindow.appendChild(errorDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            
            await createLog('KS1 Assistant', 'Network error', 'Failed');
        }
    };

    if (chatSend) chatSend.addEventListener('click', sendMessage);
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === agentModal) { agentModal.style.display = 'none'; clearAgentForm(); }
        if (e.target === projectModal) { projectModal.style.display = 'none'; clearProjectForm(); }
        if (e.target === knowledgeModal) { knowledgeModal.style.display = 'none'; clearKnowledgeForm(); }
        if (e.target === viewModal) { closeViewModal(); }
    });

    console.log('✅ KS1 Command Center initialized successfully');
});
