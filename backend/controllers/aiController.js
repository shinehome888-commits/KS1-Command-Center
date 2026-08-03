const { callDeepSeek } = require('../services/aiService');
const Conversation = require('../models/Conversation');

const chatWithAI = async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }

        console.log(`💬 Processing message: "${message.substring(0, 50)}..."`);
        
        const result = await callDeepSeek(message);
        
        // ✅ SAVE CONVERSATION IF USER IS AUTHENTICATED
        let savedConversationId = conversationId;
        let conversationTitle = null;
        
        if (req.user && result.success) {
            try {
                if (conversationId) {
                    // Continue existing conversation
                    const conversation = await Conversation.findOneAndUpdate(
                        { _id: conversationId, userId: req.user.id },
                        { 
                            $push: { 
                                messages: { 
                                    $each: [
                                        { role: 'user', content: message },
                                        { role: 'assistant', content: result.response }
                                    ]
                                }
                            },
                            updatedAt: Date.now()
                        },
                        { new: true }
                    );
                    
                    if (conversation) {
                        savedConversationId = conversation._id.toString();
                        conversationTitle = conversation.title;
                    }
                } else {
                    // Create new conversation
                    const title = message.length > 50 
                        ? message.substring(0, 50) + '...' 
                        : message;
                    
                    const newConversation = await Conversation.create({
                        userId: req.user.id,
                        title: title,
                        messages: [
                            { role: 'user', content: message },
                            { role: 'assistant', content: result.response }
                        ]
                    });
                    
                    savedConversationId = newConversation._id.toString();
                    conversationTitle = newConversation.title;
                }
            } catch (convError) {
                console.error('❌ Error saving conversation:', convError);
                // Don't fail the whole request if conversation save fails
            }
        }
        
        // ALWAYS return success:true so frontend doesn't break
        res.status(200).json({ 
            success: true,
            data: {
                userMessage: message,
                aiResponse: result.response,
                aiPowered: result.success,
                conversationId: savedConversationId,
                conversationTitle: conversationTitle
            }
        });
    } catch (error) {
        console.error('❌ AI Controller error:', error);
        res.status(200).json({ 
            success: true,
            data: {
                userMessage: req.body.message || '',
                aiResponse: "I'm having a moment, King Solomon. Please try again.",
                aiPowered: false
            }
        });
    }
};

module.exports = { chatWithAI };
