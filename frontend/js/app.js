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
                                <button onclick="deleteProject('${project._id}')" style="padding: 4px 8px; background: rgba(255, 50, 50, 0.15); color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: bold;">Delete</button>
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
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px;">
                                <span class="status-text">${agent.status}</span>
                                <button onclick="deleteAgent('${agent._id}')" style="padding: 4px 8px; background: rgba(255, 50, 50, 0.15); color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: bold;">Delete</button>
                            </div>
                        `;
                        container.appendChild(card);
                    });
                }
            }
        } catch (error) {
            console.error('❌ Error loading agents:', error);
        }
    };

    // --- 3. Fetch and Render Knowledge Articles ---
    const loadKnowledge = async () => {
        try {
            const response = await fetch(`${API_URL}/knowledge`);
            const result = await response.json();
            const container = document.getElementById('knowledge-grid');
            
            if (container) {
                if (result.success && result.data.length > 0) {
                    container.innerHTML = '';
                    result.data.forEach(article => {
                        const card = document.createElement('div');
                        card.className = 'card';
                        card.style.cssText = 'background: var(--black); padding: 20px; border-radius: 8px; border: 1px solid var(--light-grey);';
                        
                        const date = new Date(article.createdAt).toLocaleDateString();
                        
                        card.innerHTML = `
                            <h4 style="color: var(--gold); margin-bottom: 8px;">${article.title}</h4>
                            <p style="color: rgba(255,255,255,0.6); font-size: 0.85rem; margin-bottom: 12px;">Category: ${article.category} • ${date}</p>
                            <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; line-height: 1.6; margin-bottom: 15px; white-space: pre-wrap;">${article.content}</p>
                            <button onclick="deleteKnowledge('${article._id}')" style="padding: 6px 12px; background: rgba(255, 50, 50, 0.15); color: #ff4444; border: 1px solid #ff4444; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: bold;">Delete Article</button>
                        `;
                        container.appendChild(card);
                    });
                } else {
                    container.innerHTML = '<p style="color: rgba(255,255,255,0.5); grid-column: 1/-1;">No knowledge articles yet. Click "+ Add Knowledge Article" to begin building your knowledge base.</p>';
                }
            }
        } catch (error) {
            console.error('❌ Error loading knowledge:', error);
        }
    };

    // --- 4. Fetch and Render Activity Logs ---
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

    // --- 5. Add New Project Logic ---
    const toggleProjectBtn = document.getElementById('toggleProjectFormBtn');
    const projectForm = document.getElementById('addProjectForm');
    const cancelProjectBtn = document.getElementById('cancelProjectBtn');
    const submitProjectBtn = document.getElementById('submitProjectBtn');

    if (toggleProjectBtn && projectForm) {
        toggleProjectBtn.addEventListener('click', () => {
            projectForm.style.display = projectForm.style.display === 'none' ? 'block' : 'none';
        });

        cancelProjectBtn.addEventListener('click', () => {
            projectForm.style.display = 'none';
            document.getElementById('newProjectName').value = '';
            document.getElementById('newProjectDesc').value = '';
        });

        submitProjectBtn.addEventListener('click', async () => {
            const name = document.getElementById('newProjectName').value.trim();
            const description = document.getElementById('newProjectDesc').value.trim();
            const category = document.getElementById('newProjectCategory').value;

            if (!name || !description) {
                alert('Please fill in the project name and description.');
                return;
            }

            submitProjectBtn.textContent = 'Saving...';
            submitProjectBtn.disabled = true;

            try {
                const response = await fetch(`${API_URL}/projects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, description, category, status: 'Planning' })
                });

                const result = await response.json();

                if (result.success) {
                    alert('✅ Project added successfully to the Command Center!');
                    projectForm.style.display = 'none';
                    document.getElementById('newProjectName').value = '';
                    document.getElementById('newProjectDesc').value = '';
                    loadProjects();
                    await createLog('King Solomon', `Created project: ${name}`, 'Success');
                    loadLogs();
                } else {
                    alert('❌ Failed to add project: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Network error. Please check your connection and try again.');
            } finally {
                submitProjectBtn.textContent = 'Save to Database';
                submitProjectBtn.disabled = false;
            }
        });
    }

    // --- 6. Add New Agent Logic ---
    const toggleAgentBtn = document.getElementById('toggleAgentFormBtn');
    const agentForm = document.getElementById('addAgentForm');
    const cancelAgentBtn = document.getElementById('cancelAgentBtn');
    const submitAgentBtn = document.getElementById('submitAgentBtn');

    if (toggleAgentBtn && agentForm) {
        toggleAgentBtn.addEventListener('click', () => {
            agentForm.style.display = agentForm.style.display === 'none' ? 'block' : 'none';
        });

        cancelAgentBtn.addEventListener('click', () => {
            agentForm.style.display = 'none';
            document.getElementById('newAgentName').value = '';
            document.getElementById('newAgentRole').value = '';
        });

        submitAgentBtn.addEventListener('click', async () => {
            const name = document.getElementById('newAgentName').value.trim();
            const role = document.getElementById('newAgentRole').value.trim();
            const status = document.getElementById('newAgentStatus').value;

            if (!name || !role) {
                alert('Please fill in the agent name and role.');
                return;
            }

            submitAgentBtn.textContent = 'Deploying...';
            submitAgentBtn.disabled = true;

            try {
                const response = await fetch(`${API_URL}/agents`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, role, status })
                });

                const result = await response.json();

                if (result.success) {
                    alert(`✅ ${name} has been deployed to the AI Workforce!`);
                    agentForm.style.display = 'none';
                    document.getElementById('newAgentName').value = '';
                    document.getElementById('newAgentRole').value = '';
                    loadAgents();
                    await createLog('King Solomon', `Deployed agent: ${name}`, 'Success');
                    loadLogs();
                } else {
                    alert('❌ Failed to deploy agent: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Network error. Please check your connection and try again.');
            } finally {
                submitAgentBtn.textContent = 'Deploy Agent';
                submitAgentBtn.disabled = false;
            }
        });
    }

    // --- 7. Add New Knowledge Logic ---
    const toggleKnowledgeBtn = document.getElementById('toggleKnowledgeFormBtn');
    const knowledgeForm = document.getElementById('addKnowledgeForm');
    const cancelKnowledgeBtn = document.getElementById('cancelKnowledgeBtn');
    const submitKnowledgeBtn = document.getElementById('submitKnowledgeBtn');

    if (toggleKnowledgeBtn && knowledgeForm) {
        toggleKnowledgeBtn.addEventListener('click', () => {
            knowledgeForm.style.display = knowledgeForm.style.display === 'none' ? 'block' : 'none';
        });

        cancelKnowledgeBtn.addEventListener('click', () => {
            knowledgeForm.style.display = 'none';
            document.getElementById('newKnowledgeTitle').value = '';
            document.getElementById('newKnowledgeContent').value = '';
        });

        submitKnowledgeBtn.addEventListener('click', async () => {
            const title = document.getElementById('newKnowledgeTitle').value.trim();
            const category = document.getElementById('newKnowledgeCategory').value;
            const content = document.getElementById('newKnowledgeContent').value.trim();

            if (!title || !content) {
                alert('Please fill in the article title and content.');
                return;
            }

            submitKnowledgeBtn.textContent = 'Saving...';
            submitKnowledgeBtn.disabled = true;

            try {
                const response = await fetch(`${API_URL}/knowledge`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title, category, content })
                });

                const result = await response.json();

                if (result.success) {
                    alert('✅ Knowledge article added successfully!');
                    knowledgeForm.style.display = 'none';
                    document.getElementById('newKnowledgeTitle').value = '';
                    document.getElementById('newKnowledgeContent').value = '';
                    loadKnowledge();
                    await createLog('King Solomon', `Added knowledge: ${title}`, 'Success');
                    loadLogs();
                } else {
                    alert('❌ Failed to add knowledge: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Network error. Please check your connection and try again.');
            } finally {
                submitKnowledgeBtn.textContent = 'Save Article';
                submitKnowledgeBtn.disabled = false;
            }
        });
    }

    // --- 8. AI Chat Logic with Activity Logging ---
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

        await createLog('King Solomon', `Sent command: "${message}"`, 'Success');

        setTimeout(async () => {
            const botDiv = document.createElement('div');
            botDiv.classList.add('chat-message', 'bot');
            botDiv.textContent = `KS1 Assistant: Command received. Processing "${message}" via backend API.`;
            chatWindow.appendChild(botDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
            
            await createLog('KS1 Assistant', `Responded to: "${message}"`, 'Success');
            loadLogs();
        }, 800);
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    // --- 9. Helper Function to Create Activity Logs ---
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

    // --- 10. GLOBAL DELETE PROJECT FUNCTION ---
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
                await createLog('King Solomon', 'Deleted a project', 'Success');
                loadLogs();
            } else {
                alert('❌ Failed to delete: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Network error. Please try again.');
        }
    };

    // --- 11. GLOBAL DELETE AGENT FUNCTION ---
    window.deleteAgent = async (id) => {
        if (!confirm('Are you sure you want to decommission this AI Agent from the Command Center?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/agents/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Agent decommissioned successfully!');
                loadAgents();
                await createLog('King Solomon', 'Decommissioned an AI Agent', 'Success');
                loadLogs();
            } else {
                alert('❌ Failed to decommission: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Network error. Please try again.');
        }
    };

    // --- 12. GLOBAL DELETE KNOWLEDGE FUNCTION ---
    window.deleteKnowledge = async (id) => {
        if (!confirm('Are you sure you want to permanently delete this knowledge article?')) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}/knowledge/${id}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                alert('✅ Knowledge article deleted successfully!');
                loadKnowledge();
                await createLog('King Solomon', 'Deleted a knowledge article', 'Success');
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
    loadKnowledge();
    loadLogs();
});
