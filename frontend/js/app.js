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

    // --- CHAT PLACEHOLDER ---
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatWindow = document.getElementById('chat-window');

    chatSend.addEventListener('click', () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-message user';
        userDiv.textContent = message;
        chatWindow.appendChild(userDiv);
        chatInput.value = '';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // Placeholder bot response
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
