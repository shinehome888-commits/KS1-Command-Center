document.addEventListener('DOMContentLoaded', () => {
    // POINT THIS TO YOUR LIVE RENDER URL
    const API_URL = 'https://ks1-command-center-api.onrender.com/api';

    // --- 1. Fetch and Render Projects ---
    const loadProjects = async () => {
        try {
            const response = await fetch(`${API_URL}/projects`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const container = document.querySelector('.section-card:nth-of-type(3) .grid-layout'); // Targets the Projects grid
                container.innerHTML = ''; // Clear hardcoded HTML
                
                result.data.forEach(project => {
                    const card = document.createElement('div');
                    card.className = 'card project-card';
                    card.innerHTML = `
                        <h4>${project.name}</h4>
                        <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-bottom: 8px;">${project.description}</p>
                        <p class="category">Category: ${project.category}</p>
                        <span style="display:inline-block; margin-top:10px; padding: 4px 8px; background: rgba(212, 175, 55, 0.2); color: #D4AF37; border-radius: 4px; font-size: 0.8rem;">${project.status}</span>
                    `;
                    container.appendChild(card);
                });
            }
        } catch (error) {
            console.error('Error loading projects:', error);
        }
    };

    // --- 2. Fetch and Render AI Agents ---
    const loadAgents = async () => {
        try {
            const response = await fetch(`${API_URL}/agents`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const container = document.querySelector('.section-card:nth-of-type(2) .grid-layout'); // Targets the Agents grid
                container.innerHTML = ''; // Clear hardcoded HTML
                
                result.data.forEach(agent => {
                    const statusClass = agent.status.toLowerCase(); // 'online', 'ready', or 'standby'
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
        } catch (error) {
            console.error('Error loading agents:', error);
        }
    };

    // --- 3. AI Chat Placeholder Logic ---
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatWindow = document.getElementById('chatWindow');

    const sendMessage = () => {
        const message = chatInput.value.trim();
        if (!message) return;

        const userDiv = document.createElement('div');
        userDiv.classList.add('chat-message', 'user');
        userDiv.textContent = message;
        chatWindow.appendChild(userDiv);
        chatInput.value = '';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        setTimeout(() => {
            const botDiv = document.createElement('div');
            botDiv.classList.add('chat-message', 'bot');
            botDiv.textContent = `KS1 Assistant: Command received. Processing "${message}" via backend API.`;
            chatWindow.appendChild(botDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 800);
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

    // --- Initialize Dashboard ---
    loadProjects();
    loadAgents();
});
