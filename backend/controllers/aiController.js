const { callDeepSeek } = require('../services/aiService');
const Conversation = require('../models/Conversation');

const chatWithAI = async (req, res) => {
    try {
        const { message, conversationId } = req.body;
        
        console.log('💬 AI Chat request received');
        console.log('📝 Message:', message?.substring(0, 50));
        console.log('🔑 Conversation ID:', conversationId);
        console.log('👤 User authenticated:', !!req.user);
        
        if (!message || message.trim() === '') {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }

        const result = await callDeepSeek(message);
        
        let savedConversationId = conversationId;
        let conversationTitle = null;
        
        // ✅ SAVE CONVERSATION IF USER IS AUTHENTICATED
        if (req.user && result.success) {
            try {
                console.log('💾 Attempting to save conversation...');
                
                if (conversationId) {
                    // Continue existing conversation
                    console.log('📎 Continuing conversation:', conversationId);
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
                        console.log('✅ Conversation updated successfully');
                    } else {
                        console.error('❌ Conversation not found or access denied');
                    }
                } else {
                    // Create new conversation
                    console.log('🆕 Creating new conversation');
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
                    console.log('✅ New conversation created:', savedConversationId);
                }
            } catch (convError) {
                console.error('❌ Error saving conversation:', convError);
                console.error('Stack:', convError.stack);
                // Don't fail the whole request if conversation save fails
            }
        } else {
            if (!req.user) {
                console.log('⚠️ No user authenticated - conversation not saved');
            }
            if (!result.success) {
                console.log('⚠️ AI response failed - conversation not saved');
            }
        }
        
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
        console.error('Stack:', error.stack);
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
