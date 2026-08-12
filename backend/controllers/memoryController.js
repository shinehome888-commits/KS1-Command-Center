const AgentMemory = require('../models/AgentMemory');

// Extract keywords from text
const extractKeywords = (text) => {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very']);
    
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word))
        .slice(0, 15);
};

// Categorize task
const categorizeTask = (title, description) => {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.match(/schedule|meeting|calendar|coordinate|timeline|plan/)) return 'Operations';
    if (text.match(/research|analyze|study|investigate|review/)) return 'Research';
    if (text.match(/code|build|develop|implement|program|api|database/)) return 'Development';
    if (text.match(/write|document|content|article|report/)) return 'Documentation';
    if (text.match(/design|create|ui|ux|interface/)) return 'Design';
    if (text.match(/test|debug|fix|error|bug/)) return 'Testing';
    if (text.match(/market|strategy|business|sales/)) return 'Business';
    
    return 'General';
};

// Get all memories for an agent
const getAgentMemories = async (req, res) => {
    try {
        const memories = await AgentMemory.find({ 
            agentId: req.params.agentId,
            createdBy: req.user.id 
        }).sort({ createdAt: -1 }).limit(100);
        
        res.json({ success: true, data: memories });
    } catch (error) {
        console.error('Get memories error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get similar memories for a task (used during task execution)
const getSimilarMemories = async (req, res) => {
    try {
        const { agentId, taskTitle, taskDescription } = req.body;
        
        const keywords = extractKeywords(taskTitle + ' ' + taskDescription);
        
        if (keywords.length === 0) {
            return res.json({ success: true, data: [] });
        }
        
        // Find memories that match any keyword
        const memories = await AgentMemory.find({
            agentId: agentId,
            status: 'Completed',
            $or: [
                { keywords: { $in: keywords } },
                { taskTitle: { $regex: keywords.join('|'), $options: 'i' } },
                { taskDescription: { $regex: keywords.join('|'), $options: 'i' } }
            ]
        })
        .sort({ createdAt: -1 })
        .limit(5);
        
        res.json({ success: true, data: memories, keywords });
    } catch (error) {
        console.error('Get similar memories error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Save a new memory (called after task completion)
const saveMemory = async (agentId, agentName, taskTitle, taskDescription, taskResult, status, userId) => {
    try {
        const keywords = extractKeywords(taskTitle + ' ' + taskDescription + ' ' + taskResult);
        const category = categorizeTask(taskTitle, taskDescription);
        
        await AgentMemory.create({
            agentId,
            agentName,
            taskTitle,
            taskDescription,
            taskResult,
            status,
            category,
            keywords,
            createdBy: userId
        });
        
        console.log(`💾 Memory saved for ${agentName}: ${taskTitle}`);
    } catch (error) {
        console.error('Save memory error:', error);
    }
};

// Delete a specific memory
const deleteMemory = async (req, res) => {
    try {
        const memory = await AgentMemory.findOneAndDelete({ 
            _id: req.params.id, 
            createdBy: req.user.id 
        });
        
        if (!memory) {
            return res.status(404).json({ success: false, message: 'Memory not found' });
        }
        
        res.json({ success: true, message: 'Memory deleted successfully' });
    } catch (error) {
        console.error('Delete memory error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Clear all memories for an agent
const clearAgentMemories = async (req, res) => {
    try {
        const result = await AgentMemory.deleteMany({ 
            agentId: req.params.agentId,
            createdBy: req.user.id 
        });
        
        res.json({ 
            success: true, 
            message: `Cleared ${result.deletedCount} memories`,
            data: { deletedCount: result.deletedCount }
        });
    } catch (error) {
        console.error('Clear memories error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get memory stats for all agents
const getMemoryStats = async (req, res) => {
    try {
        const stats = await AgentMemory.aggregate([
            { $match: { createdBy: req.user._id || req.user.id } },
            {
                $group: {
                    _id: '$agentId',
                    agentName: { $first: '$agentName' },
                    totalMemories: { $sum: 1 },
                    completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
                    failedTasks: { $sum: { $cond: [{ $eq: ['$status', 'Failed'] }, 1, 0] } },
                    categories: { $addToSet: '$category' },
                    lastMemory: { $max: '$createdAt' }
                }
            }
        ]);
        
        // Add experience level
        const statsWithLevel = stats.map(stat => {
            let level = 'Novice';
            if (stat.totalMemories >= 30) level = 'Expert';
            else if (stat.totalMemories >= 16) level = 'Advanced';
            else if (stat.totalMemories >= 6) level = 'Experienced';
            
            return { ...stat, level };
        });
        
        res.json({ success: true, data: statsWithLevel });
    } catch (error) {
        console.error('Get memory stats error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAgentMemories,
    getSimilarMemories,
    saveMemory,
    deleteMemory,
    clearAgentMemories,
    getMemoryStats
};
