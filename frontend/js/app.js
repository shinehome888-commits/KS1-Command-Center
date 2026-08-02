document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://ks1-command-center-api.onrender.com/api';

    console.log('🚀 KS1 Command Center initializing...');

    // Load all data on page load
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
                        <div class="status-indicator ${statusClass}"></div>
                        <h4>${agent.name}</h4>
                        <p class="role">${agent.role}</p>
                        <span class="status-text">${agent.status}</span>
                    `;
                    container.appendChild(card);
                });
                console.log('✅ Agents loaded successfully');
            }
        } catch (error) {
            console.error('❌ Error loading agents:', error);
        }
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
        } catch (error) {
            console.error('❌ Error loading projects:', error);
        }
    }

    // --- LOAD KNOWLEDGE ---
    async function loadKnowledge() {
        try {
            const response = await fetch(`${API_URL}/knowledge`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const container = document.getElementById('knowledge-grid');
                container.innerHTML = '';
                
                result.data.forEach(article => {
                    const date = new Date(article.createdAt).toLocaleDateString();
                    const snippet = article.content.substring(0, 100) + '...';
                    const card = document.createElement('div');
                    card.className = 'card knowledge-card';
                    card.innerHTML = `
                        <h4>${article.title}</h4>
                        <p class="meta">${article.category} • ${date}</p>
                        <p class="snippet">${snippet}</p>
                    `;
                    container.appendChild(card);
                });
                console.log('✅ Knowledge loaded successfully');
            }
        } catch (error) {
            console.error('❌ Error loading knowledge:', error);
        }
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
                            <span class="badge-log success">${log.status}</span>
                            <span class="log-time">${timestamp}</span>
                        </div>
                    `;
                    container.appendChild(logItem);
                });
                console.log('✅ Activity log loaded successfully');
            } else {
                container.innerHTML = '<p style="color: rgba(255,255,255,0.5);">No activity logs yet.</p>';
            }
        } catch (error) {
            console.error('❌ Error loading activity log:', error);
        }
    }

    // --- CREATE ACTIVITY LOG ---
    async function createLog(actor, action, status = 'Success') {
        try {
            await fetch(`${API_URL}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actor, action, status })
            });
            // Refresh the activity log display
            loadActivityLog();
        } catch (error) {
            console.error('❌ Error creating log:', error);
        }
    }

    // --- ADD PROJECT FORM LOGIC ---
    const addProjectBtn = document.getElementById('add-project-btn');
    const addProjectForm = document.getElementById('add-project-form');
    const cancelProjectBtn = document.getElementById('cancel-project-btn');
    const submitProjectBtn = document.getElementById('submit-project-btn');

    addProjectBtn.addEventListener('click', () => {
        addProjectForm.style.display = 'block';
        addProjectBtn.style.display = 'none';
    });

    cancelProjectBtn.addEventListener('click', () => {
        addProjectForm.style.display = 'none';
        addProjectBtn.style.display = 'block';
        document.getElementById('project-name').value = '';
        document.getElementById('project-description').value = '';
    });

    submitProjectBtn.addEventListener('click', async () => {
        const name = document.getElementById('project-name').value.trim();
        const description = document.getElementById('project-description').value.trim();
        const category = document.getElementById('project-category').value;

        if (!name || !description) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, category, status: 'Planning' })
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Project created successfully!');
                addProjectForm.style.display = 'none';
                addProjectBtn.style.display = 'block';
                document.getElementById('project-name').value = '';
                document.getElementById('project-description').value = '';
                loadProjects();
                
                // Log this action
                await createLog('King Solomon', `Created project: ${name}`, 'Success');
            } else {
                alert('❌ Error: ' + result.message);
            }
        } catch (error) {
            console.error('❌ Error creating project:', error);
            alert('❌ Network error. Please try again.');
        }
    });

    // --- DELETE PROJECT FUNCTION ---
    window.deleteProject = async (id) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Project deleted successfully!');
                loadProjects();
                
                // Log this action
                await createLog('King Solomon', 'Deleted a project', 'Success');
            } else {
                alert('❌ Error: ' + result.message);
            }
        } catch (error) {
            console.error('❌ Error deleting project:', error);
            alert('❌ Network error. Please try again.');
        }
    };

    // --- CHAT PLACEHOLDER ---
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatWindow = document.getElementById('chat-window');

    chatSend.addEventListener('click', async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        const userDiv = document.createElement('div');
        userDiv.className = 'chat-message user';
        userDiv.textContent = message;
        chatWindow.appendChild(userDiv);
        chatInput.value = '';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Log chat message
        await createLog('King Solomon', `Sent chat message: "${message}"`, 'Success');

        setTimeout(() => {
            const botDiv = document.createElement('div');
            botDiv.className = 'chat-message bot';
            botDiv.textContent = `KS1 Assistant: Command received. Processing "${message}" via backend API.`;
            chatWindow.appendChild(botDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 800);
    });

    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') chatSend.click();
    });

    console.log('✅ KS1 Command Center initialized successfully');
});
