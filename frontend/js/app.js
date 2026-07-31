document.addEventListener('DOMContentLoaded', () => {
    // REPLACE THIS WITH YOUR ACTUAL RENDER URL
    const API_URL = 'https://ks1-command-center-api.onrender.com/api'; 

    // --- Fetch and Display Projects ---
    const fetchProjects = async () => {
        try {
            const response = await fetch(`${API_URL}/projects`);
            const result = await response.json();
            
            if (result.success && result.data.length > 0) {
                const projectContainer = document.querySelector('.grid-layout'); // Adjust selector to your projects section
                // Note: For now, we will log it to console to verify connection
                console.log('Projects loaded:', result.data);
            } else {
                console.log('No projects found or API not connected yet.');
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    // --- Fetch and Display Agents ---
    const fetchAgents = async () => {
        try {
            const response = await fetch(`${API_URL}/agents`);
            const result = await response.json();
            console.log('Agents loaded:', result.data);
        } catch (error) {
            console.error('Error fetching agents:', error);
        }
    };

    // Initialize
    fetchProjects();
    fetchAgents();

    // --- AI Chat Placeholder Logic (Unchanged) ---
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatWindow = document.getElementById('chatWindow');

    const sendMessage = () => {
        const message = chatInput.value.trim();
        if (!message) return;
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-message', 'user');
        msgDiv.textContent = message;
        chatWindow.appendChild(msgDiv);
        chatInput.value = '';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        setTimeout(() => {
            const botDiv = document.createElement('div');
            botDiv.classList.add('chat-message', 'bot');
            botDiv.textContent = "KS1 Assistant: Command received. Processing via backend API.";
            chatWindow.appendChild(botDiv);
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }, 800);
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
});
