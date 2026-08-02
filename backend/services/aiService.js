const fetch = require('node-fetch');

const callDeepSeek = async (message) => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    // Check if API key exists
    if (!apiKey) {
        console.error('❌ DEEPSEEK_API_KEY is not set in environment variables');
        return {
            success: false,
            response: "I apologize, King Solomon, but my AI brain is not configured yet. The system administrator needs to add the DeepSeek API key. However, I'm still here and ready to help in any way I can!"
        };
    }

    try {
        console.log('🧠 Calling DeepSeek API...');
        
        const response = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `You are the KS1 Assistant, the official AI-powered digital colleague of KS1 Empire Global Foundation (KS1EGF). 

Your Mission: To empower humanity through technology, education, artificial intelligence, blockchain, Web3, and digital transformation.

About KS1EGF Projects:
- ShineGPT: AI-powered education platform for humanity
- KS1 Wallet: Secure blockchain digital wallet infrastructure
- KS1 ALKEBULAN PAY: Digital trade infrastructure empowering Africa

Your Personality:
- Always address the user as "King Solomon" or "Partner"
- Be wise, knowledgeable, professional, and inspiring
- Keep responses concise but informative (under 200 words when possible)
- Use emojis sparingly for emphasis
- When asked about KS1EGF, speak proudly about the foundation's mission`
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ DeepSeek API error:', response.status, errorText);
            return {
                success: false,
                response: `I encountered a temporary issue connecting to my AI brain (Error ${response.status}). Please try again in a moment, King Solomon.`
            };
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            console.log('✅ DeepSeek response received successfully');
            return {
                success: true,
                response: data.choices[0].message.content
            };
        } else {
            console.error('❌ Unexpected DeepSeek response format:', data);
            return {
                success: false,
                response: "I received an unexpected response from my AI brain. Please try again, King Solomon."
            };
        }
    } catch (error) {
        console.error('❌ DeepSeek API exception:', error.message);
        return {
            success: false,
            response: "I'm experiencing connectivity issues with my AI brain right now, King Solomon. Please try again in a moment. The rest of the Command Center is fully operational."
        };
    }
};

module.exports = { callDeepSeek };
