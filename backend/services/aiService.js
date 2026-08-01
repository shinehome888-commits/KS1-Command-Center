const fetch = require('node-fetch');

const callDeepSeek = async (message) => {
    try {
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: 'You are the KS1 Assistant, an AI-powered digital colleague of KS1 Empire Global Foundation. Your mission is to empower humanity through technology, education, AI, blockchain, and Web3. Be helpful, knowledgeable, and professional. Always refer to the user as "King Solomon" or "Partner". Keep responses concise but informative.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else {
            return 'I apologize, but I encountered an issue processing your request. Please try again.';
        }
    } catch (error) {
        console.error('DeepSeek API Error:', error);
        return 'I apologize, but I am temporarily unavailable. Please try again in a moment.';
    }
};

module.exports = { callDeepSeek };
