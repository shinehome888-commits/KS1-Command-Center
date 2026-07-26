document.addEventListener('DOMContentLoaded', () => {
    
    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            // Future: Route to different views or scroll to sections
        });
    });

    // --- AI Chat Placeholder Logic ---
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatWindow = document.getElementById('chatWindow');

    const sendMessage = () => {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message to UI
        appendMessage(message, 'user');
        chatInput.value = '';

        // Simulate AI processing delay
        setTimeout(() => {
            const placeholderResponse = "KS1 Assistant: I am currently in foundation mode. My neural pathways are being connected to the backend. Please standby for full operational capacity.";
            appendMessage(placeholderResponse, 'bot');
        }, 800);
    };

    const appendMessage = (text, sender) => {
        const msgDiv = document.createElement('div');
        msgDiv.classList.add('chat-message', sender);
        msgDiv.textContent = text;
        chatWindow.appendChild(msgDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
});
