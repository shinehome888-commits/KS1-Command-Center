document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://ks1-command-center-api.onrender.com/api';
    const userName = 'King Solomon';

    // Initialize Dashboard immediately (no login required)
    loadProjects();
    loadAgents();
    loadKnowledge();
    loadLogs();

    // --- 1. PROJECTS ---
    const loadProjects = async () => {
        try {
            const res = await fetch(`${API_URL}/projects`);
            const result = await res.json();
            if (result.success && result.data.length > 0) {
                const container = document.getElementById('projects-grid');
                container.innerHTML = '';
                result.data.forEach(project => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <h4>${project.name}</h4>
                        <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-bottom: 8px;">${project.description}</p>
                        <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">Category: ${project.category}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                            <span style="padding: 4px 8px; background: rgba(212, 175, 55, 0.2); color: #D4AF37; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${project.status}</span>
                            <button onclick="deleteProject('${project._id}')" style="padding: 4px 8px; background: rgba(255, 50, 50, 0.15); color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: bold;">Delete</button>
                        </div>
                    `;
                    container.appendChild(card);
                });
            }
        } catch (error) { console.error('❌ Error loading projects:', error); }
    };

    // --- 2. AGENTS ---
    const loadAgents = async () => {
        try {
            const res = await fetch(`${API_URL}/agents`);
            const result = await res.json();
            if (result.success && result.data.length > 0) {
                const container = document.getElementById('agents-grid');
                container.innerHTML = '';
                result.data.forEach(agent => {
                    const statusClass = agent.status.toLowerCase();
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.innerHTML = `
                        <div class="status-indicator ${statusClass}"></div>
                        <h4>${agent.name}</h4>
                        <p style="color: rgba(255,255,255,0.6); font-size: 0.9rem;">${agent.role}</p>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                            <span style="font-size: 0.8rem; color: rgba(255,255,255,0.5);">${agent.status}</span>
                            <button onclick="deleteAgent('${agent._id}')" style="padding: 4px 8px; background: rgba(255, 50, 50, 0.15); color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: bold;">Delete</button>
                        </div>
                    `;
                    container.appendChild(card);
                });
            }
        } catch (error) { console.error('❌ Error loading agents:', error); }
    };

    // --- 3. KNOWLEDGE (COLLAPSIBLE) ---
    const loadKnowledge = async () => {
        try {
            const res = await fetch(`${API_URL}/knowledge`);
            const result = await res.json();
            const container = document.getElementById('knowledge-grid');
            if (result.success && result.data.length > 0) {
                container.innerHTML = '';
                result.data.forEach(article => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.style.cursor = 'pointer';
                    const date = new Date(article.createdAt).toLocaleDateString();
                    card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="color: var(--gold); margin-bottom: 4px;">${article.title}</h4>
                                <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">${article.category} • ${date}</p>
                            </div>
                            <span style="color: var(--gold); font-size: 1.2rem; transition: transform 0.3s;">▼</span>
                        </div>
                        <div class="knowledge-content" style="display: none; margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--light-grey);">
                            <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; line-height: 1.6; margin-bottom: 15px; white-space: pre-wrap;">${article.content}</p>
                            <button onclick="event.stopPropagation(); deleteKnowledge('${article._id}')" style="padding: 6px 12px; background: rgba(255, 50, 50, 0.15); color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: bold;">Delete Article</button>
                        </div>
                    `;
                    card.addEventListener('click', () => {
                        const content = card.querySelector('.knowledge-content');
                        const icon = card.querySelector('span');
                        if (content.style.display === 'none') {
                            content.style.display = 'block';
                            icon.style.transform = 'rotate(180deg)';
                        } else {
                            content.style.display = 'none';
                            icon.style.transform = 'rotate(0deg)';
                        }
                    });
                    container.appendChild(card);
                });
            } else {
                container.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No knowledge articles yet.</p>';
            }
        } catch (error) { console.error('❌ Error loading knowledge:', error); }
    };

    // --- 4. ACTIVITY LOGS ---
    const loadLogs = async () => {
        try {
            const res = await fetch(`${API_URL}/logs`);
            const result = await res.json();
            const container = document.getElementById('activity-log-container');
            if (result.success && result.data.length > 0) {
                container.innerHTML = '';
                result.data.forEach(log => {
                    const logItem = document.createElement('div');
                    logItem.style.cssText = 'padding: 12px; border-bottom: 1px solid var(--light-grey); display: flex; justify-content: space-between; align-items: center;';
                    const timestamp = new Date(log.createdAt).toLocaleString();
                    const statusColor = log.status === 'Success' ? '#10B981' : '#ff4444';
                    logItem.innerHTML = `
                        <div><strong style="color: var(--gold);">${log.actor}</strong><span style="color: rgba(255,255,255,0.8); margin-left: 8px;">${log.action}</span></div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="padding: 3px 8px; background: ${statusColor}22; color: ${statusColor}; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">${log.status}</span>
                            <span style="color: rgba(255,255,255,0.4); font-size: 0.75rem;">${timestamp}</span>
                        </div>
                    `;
                    container.appendChild(logItem);
                });
            } else {
                container.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No activity logs yet.</p>';
            }
        } catch (error) { console.error('❌ Error loading logs:', error); }
    };

    // --- 5. CREATE LOG ---
    const createLog = async (actor, action, status) => {
        try {
            await fetch(`${API_URL}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actor, action, status })
            });
        } catch (error) { console.error('Error creating log:', error); }
    };

    // --- 6. DELETE FUNCTIONS ---
    window.deleteProject = async (id) => {
        if (!confirm('Delete this project?')) return;
        const res = await fetch(`${API_URL}/projects/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) { loadProjects(); createLog(userName, 'Deleted a project', 'Success'); loadLogs(); }
    };
    window.deleteAgent = async (id) => {
        if (!confirm('Decommission this AI Agent?')) return;
        const res = await fetch(`${API_URL}/agents/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) { loadAgents(); createLog(userName, 'Decommissioned an AI Agent', 'Success'); loadLogs(); }
    };
    window.deleteKnowledge = async (id) => {
        if (!confirm('Delete this knowledge article?')) return;
        const res = await fetch(`${API_URL}/knowledge/${id}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) { loadKnowledge(); createLog(userName, 'Deleted a knowledge article', 'Success'); loadLogs(); }
    };

    // --- 7. FORM SETUP HELPER ---
    const setupForm = (toggleBtn, form, cancelBtn, submitBtn, endpoint, payloadFn, successMsg, reloadFn, btnLabel) => {
        if (!toggleBtn || !form) return;
        toggleBtn.addEventListener('click', () => form.classList.toggle('hidden'));
        cancelBtn.addEventListener('click', () => {
            form.classList.add('hidden');
            form.querySelectorAll('input, textarea').forEach(i => i.value = '');
        });
        submitBtn.addEventListener('click', async () => {
            const payload = payloadFn();
            if (!payload) return;
            submitBtn.textContent = 'Saving...'; submitBtn.disabled = true;
            try {
                const res = await fetch(`${API_URL}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await res.json();
                if (result.success) {
                    alert(`✅ ${successMsg}`);
                    form.classList.add('hidden');
                    form.querySelectorAll('input, textarea').forEach(i => i.value = '');
                    reloadFn();
                    createLog(userName, successMsg, 'Success');
                    loadLogs();
                } else { alert('❌ ' + result.message); }
            } catch (err) { alert('❌ Network error.'); }
            finally { submitBtn.textContent = btnLabel; submitBtn.disabled = false; }
        });
    };

    setupForm(document.getElementById('toggleProjectFormBtn'), document.getElementById('addProjectForm'), document.getElementById('cancelProjectBtn'), document.getElementById('submitProjectBtn'), '/projects', () => {
        const n = document.getElementById('newProjectName').value.trim();
        const d = document.getElementById('newProjectDesc').value.trim();
        const c = document.getElementById('newProjectCategory').value;
        if (!n || !d) { alert('Fill name and description'); return null; }
        return { name: n, description: d, category: c, status: 'Planning' };
    }, 'Project added successfully!', loadProjects, 'Save to Database');

    setupForm(document.getElementById('toggleAgentFormBtn'), document.getElementById('addAgentForm'), document.getElementById('cancelAgentBtn'), document.getElementById('submitAgentBtn'), '/agents', () => {
        const n = document.getElementById('newAgentName').value.trim();
        const r = document.getElementById('newAgentRole').value.trim();
        const s = document.getElementById('newAgentStatus').value;
        if (!n || !r) { alert('Fill name and role'); return null; }
        return { name: n, role: r, status: s };
    }, 'Agent deployed successfully!', loadAgents, 'Deploy Agent');

    setupForm(document.getElementById('toggleKnowledgeFormBtn'), document.getElementById('addKnowledgeForm'), document.getElementById('cancelKnowledgeBtn'), document.getElementById('submitKnowledgeBtn'), '/knowledge', () => {
        const t = document.getElementById('newKnowledgeTitle').value.trim();
        const c = document.getElementById('newKnowledgeCategory').value;
        const cnt = document.getElementById('newKnowledgeContent').value.trim();
        if (!t || !cnt) { alert('Fill title and content'); return null; }
        return { title: t, category: c, content: cnt };
    }, 'Knowledge article added successfully!', loadKnowledge, 'Save Article');

    // --- 8. REAL AI CHAT (DEEPSEEK POWERED) ---
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatWindow = document.getElementById('chatWindow');

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Show user message
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-message user';
        userDiv.textContent = message;
        chatWindow.appendChild(userDiv);
        chatInput.value = '';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Show loading
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message bot';
        loadingDiv.textContent = '🤔 KS1 Assistant is thinking...';
        loadingDiv.id = 'loading-message';
        chatWindow.appendChild(loadingDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        await createLog(userName, `Sent command: "${message}"`, 'Success');

        try {
            const response = await fetch(`${API_URL}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            const result = await response.json();

            // Remove loading
            const loading = document.getElementById('loading-message');
            if (loading) loading.remove();

            if (result.success) {
                const botDiv = document.createElement('div');
                botDiv.className = 'chat-message bot';
                botDiv.textContent = result.data.aiResponse;
                chatWindow.appendChild(botDiv);
                chatWindow.scrollTop = chatWindow.scrollHeight;
                await createLog('KS1 Assistant', `Responded to: "${message}"`, 'Success');
                loadLogs();
            } else {
                const errorDiv = document.createElement('div');
                errorDiv.className = 'chat-message bot';
                errorDiv.textContent = '❌ I encountered an error. Please try again.';
                chatWindow.appendChild(errorDiv);
                chatWindow.scrollTop = chatWindow.scrollHeight;
            }
        } catch (error) {
            const loading = document.getElementById('loading-message');
            if (loading) loading.remove();
            const errorDiv = document.createElement('div');
            errorDiv.className = 'chat-message bot';
            errorDiv.textContent = '❌ Network error. Please try again.';
            chatWindow.appendChild(errorDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
});
