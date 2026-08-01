const { callDeepSeek } = require('../services/aiService');

// @desc    Process AI chat message
// @route   POST /api/ai/chat
const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }

        const aiResponse = await callDeepSeek(message);
        
        res.status(200).json({ 
            success: true, 
            data: {
                userMessage: message,
                aiResponse: aiResponse
            }
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to process AI request' 
        });
    }
};

module.exports = { chatWithAI };
