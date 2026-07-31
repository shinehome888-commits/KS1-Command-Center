document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://ks1-command-center-api.onrender.com/api';

    // --- 1. Fetch and Render Projects ---
    const loadProjects = async () => {
        try {
            const response = await fetch(`${API_URL}/projects`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const container = document.getElementById('projects-grid');
                if (container) {
                    container.innerHTML = ''; 
                    result.data.forEach(project => {
                        const card = document.createElement('div');
                        card.className = 'card project-card';
                        card.innerHTML = `
                            <h4>${project.name}</h4>
                            <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-bottom: 8px;">${project.description}</p>
                            <p class="category">Category: ${project.category}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                <span style="padding: 4px 8px; background: rgba(212, 175, 55, 0.2); color: #D4AF37; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${project.status}</span>
                                <button onclick="deleteProject('${project._id}')" style="padding: 4px 8px; background: rgba(255, 50, 50, 0.15); color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: bold; transition: all 0.2s;">Delete</button>
                            </div>
                        `;
                        container.appendChild(card);
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error loading projects:', error);
        }
    };

    // --- 2. Fetch and Render AI Agents ---
    const loadAgents = async () => {
        try {
            const response = await fetch(`${API_URL}/agents`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const container = document.getElementById('agents-grid');
                if (container) {
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
                }
            }
        } catch (error) {
            console.error('❌ Error loading agents:', error);
        }
    };

    // --- 3. Fetch and Render Activity Logs ---
    const loadLogs = async () => {
        try {
            const response = await fetch(`${API_URL}/logs`);
            const result = await response.json();
            const container = document.getElementById('activity-log-container');
            
            if (container) {
                if (result.success && result.data.length > 0) {
                    container.innerHTML = '';
                    result.data.forEach(log => {
                        const logItem = document.createElement('div');
                        logItem.style.cssText = 'padding: 12px; border-bottom: 1px solid var(--light-grey); display: flex; justify-content: space-between; align-items: center;';
                        
                        const timestamp = new Date(log.createdAt).toLocaleString();
                        const statusColor = log.status === 'Success' ? '#10B981' : log.status === 'Failed' ? '#ff4444' : '#D4AF37';
                        
                        logItem.innerHTML = `
                            <div>
                                <strong style="color: var(--gold);">${log.actor}</strong>
                                <span style="color: rgba(255,255,255,0.8); margin-left: 8px;">${log.action}</span>
                            </div>
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
            }
        } catch (error) {
            console.error('❌ Error loading logs:', error);
        }
    };

    // --- 4. Add New Project Logic ---
    const toggleBtn = document.getElementById('toggleProjectFormBtn');
    const form = document.getElementById('addProjectForm');
    const cancelBtn = document.getElementById('cancelProjectBtn');
    const submitBtn = document.getElementById('submitProjectBtn');

    if (toggleBtn && form) {
        toggleBtn.addEventListener('click', () => {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });

        cancelBtn.addEventListener('click', () => {
            form.style.display = 'none';
            document.getElementById('newProjectName').value = '';
            document.getElementById('newProjectDesc').value = '';
        });

        submitBtn.addEventListener('click', async () => {
            const name = document.getElementById('newProjectName').value.trim();
            const description = document.getElementById('newProjectDesc').value.trim();
            const category = document.getElementById('newProjectCategory').value;

            if (!name || !description) {
                alert('Please fill in the project name and description.');
                return;
            }

            submitBtn.textContent = 'Saving...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`${API_URL}/projects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description, category, status: 'Planning' })
                });

                const result = await response.json();

                if (result.success) {
                    alert('✅ Project added successfully to the Command Center!');
                    form.style.display = 'none';
                    document.getElementById('newProjectName').value = '';
                    document.getElementById('newProjectDesc').value = '';
                    loadProjects();
                    
                    // Log this action
                    await createLog('King Solomon', `Created project: ${name}`, 'Success');
                } else {
                    alert('❌ Failed to add project: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Network error. Please check your connection and try again.');
            } finally {
                submitBtn.textContent = 'Save to Database';
                submitBtn.disabled = false;
            }
        });
    }

    // --- 5. AI Chat Logic with Activity Logging ---
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatWindow = document.getElementById('chatWindow');

    const sendMessage = async () => {
        const message = chatInput.value.trim();
        if (!message) return;

        const userDiv = document.createElement('div');
        userDiv.classList.add('chat-message', 'user');
        userDiv.textContent = message;
        chatWindow.appendChild(userDiv);
        chatInput.value = '';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Log this chat command to the database
        await createLog('King Solomon', `Sent command: "${message}"`, 'Success');

        setTimeout(() => {
            const botDiv = document.createElement('div');
            botDiv.classList.add('chat-message', 'bot');
            botDiv.textContent = `KS1 Assistant: Command received. Processing "${message}" via backend API.`;
            chatWindow.appendChild(botDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            
            // Log the bot response
            createLog('KS1 Assistant', `Responded to: "${message}"`, 'Success');
            loadLogs(); // Refresh the activity log display
        }, 800);
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    // --- 6. Helper Function to Create Activity Logs ---
    const createLog = async (actor, action, status) => {
        try {
            await fetch(`${API_URL}/logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ actor, action, status })
            });
        } catch (error) {
            console.error('Error creating log:', error);
        }
    };

    // --- 7. GLOBAL DELETE FUNCTION ---
    window.deleteProject = async (id) => {
        if (!confirm('Are you sure you want to permanently delete this project from the Command Center?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/projects/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Project deleted successfully!');
                loadProjects();
                createLog('King Solomon', 'Deleted a project', 'Success');
                loadLogs();
            } else {
                alert('❌ Failed to delete: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Network error. Please try again.');
        }
    };

    // --- Initialize Dashboard on Load ---
    loadProjects();
    loadAgents();
    loadLogs();
});
