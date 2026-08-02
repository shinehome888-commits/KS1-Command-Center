const { callDeepSeek } = require('../services/aiService');

const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }

        console.log(`💬 Processing message: "${message.substring(0, 50)}..."`);
        
        const result = await callDeepSeek(message);
        
        // ALWAYS return success:true so frontend doesn't break
        // The "success" field in result tells us if AI actually worked
        res.status(200).json({ 
            success: true,
            data: {
                userMessage: message,
                aiResponse: result.response,
                aiPowered: result.success
            }
        });
    } catch (error) {
        console.error('❌ AI Controller error:', error);
        // NEVER fail - always return something
        res.status(200).json({ 
            success: true,
            data: {
                userMessage: req.body.message,
                aiResponse: "I'm having a moment, King Solomon. Please try again.",
                aiPowered: false
            }
        });
    }
};

module.exports = { chatWithAI };
