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
                    container.innerHTML = ''; // Clear existing
                    result.data.forEach(project => {
                        const card = document.createElement('div');
                        card.className = 'card project-card';
                        card.innerHTML = `
                            <h4>${project.name}</h4>
                            <p style="color: rgba(255,255,255,0.8); font-size: 0.9rem; margin-bottom: 8px;">${project.description}</p>
                            <p class="category">Category: ${project.category}</p>
                            <span style="display:inline-block; margin-top:10px; padding: 4px 8px; background: rgba(212, 175, 55, 0.2); color: #D4AF37; border-radius: 4px; font-size: 0.8rem; font-weight: bold;">${project.status}</span>
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
                    container.innerHTML = ''; // Clear existing
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

    // --- 3. Add New Project Logic ---
    const toggleBtn = document.getElementById('toggleProjectFormBtn');
    const form = document.getElementById('addProjectForm');
    const cancelBtn = document.getElementById('cancelProjectBtn');
    const submitBtn = document.getElementById('submitProjectBtn');

    if (toggleBtn && form) {
        // Show/Hide Form
        toggleBtn.addEventListener('click', () => {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });

        // Cancel Button
        cancelBtn.addEventListener('click', () => {
            form.style.display = 'none';
            document.getElementById('newProjectName').value = '';
            document.getElementById('newProjectDesc').value = '';
        });

        // Submit Button (Send to Backend)
        submitBtn.addEventListener('click', async () => {
            const name = document.getElementById('newProjectName').value.trim();
            const description = document.getElementById('newProjectDesc').value.trim();
            const category = document.getElementById('newProjectCategory').value;

            if (!name || !description) {
                alert('Please fill in the project name and description.');
                return;
            }

            // Disable button to prevent double clicks
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
                    loadProjects(); // Refresh the list immediately
                } else {
                    alert('❌ Failed to add project: ' + result.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('❌ Network error. Please check your connection and try again.');
            } finally {
                // Re-enable button
                submitBtn.textContent = 'Save to Database';
                submitBtn.disabled = false;
            }
        });
    }

    // --- 4. AI Chat Placeholder Logic ---
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

    // --- Initialize Dashboard on Load ---
    loadProjects();
    loadAgents();
});
