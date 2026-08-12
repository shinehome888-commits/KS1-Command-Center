const Task = require('../models/Task');
const Agent = require('../models/Agent');
const { callDeepSeek } = require('../services/aiService');
const ActivityLog = require('../models/ActivityLog');
const { saveMemory, getSimilarMemories } = require('./memoryController');
const AgentMemory = require('../models/AgentMemory');

const getUserTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user.id })
            .sort({ createdAt: -1 })
            .limit(100);
        res.json({ success: true, data: tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAgentTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ 
            assignedAgent: req.params.agentId,
            createdBy: req.user.id 
        }).sort({ createdAt: -1 });
        res.json({ success: true, data: tasks });
    } catch (error) {
        console.error('Get agent tasks error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const buildSpecializedPrompt = (agent, title, description, similarMemories) => {
    let memoryContext = '';
    
    if (similarMemories && similarMemories.length > 0) {
        memoryContext = `\n\n=== RELEVANT PAST MEMORIES (${similarMemories.length} found) ===\n`;
        memoryContext += `You have memory of similar past tasks. Reference them to provide better, more informed responses:\n\n`;
        
        similarMemories.forEach((memory, index) => {
            memoryContext += `Memory ${index + 1} (${memory.status} on ${new Date(memory.createdAt).toLocaleDateString()}):\n`;
            memoryContext += `Task: "${memory.taskTitle}"\n`;
            memoryContext += `Previous Result: ${memory.taskResult.substring(0, 400)}${memory.taskResult.length > 400 ? '...' : ''}\n`;
            memoryContext += `---\n`;
        });
        
        memoryContext += `\nINSTRUCTION: Build upon your past work. Reference previous results when relevant. Improve upon past approaches. Avoid repeating mistakes.\n`;
    } else {
        memoryContext = `\n\n=== MEMORY STATUS ===\nThis is a new type of task for you. No relevant past memories found. Approach this task with fresh perspective.\n`;
    }
    
    const baseContext = `You are ${agent.name}, serving as ${agent.role} at KS1 Empire Global Foundation (KS1EGF).

KS1EGF Mission: To empower humanity through technology, education, artificial intelligence, blockchain, Web3, and digital transformation.

Active Projects:
- ShineGPT: AI-powered education platform
- KS1 Wallet: Secure blockchain digital wallet
- KS1 ALKEBULAN PAY: Digital trade infrastructure for Africa

YOUR TASK:
Title: ${title}
Details: ${description}
${memoryContext}

`;

    let specializedInstructions = '';

    if (agent.role.toLowerCase().includes('operations') || agent.role.toLowerCase().includes('coordinator')) {
        specializedInstructions = `SPECIALIZATION: Digital Operations & Coordination. Provide a DETAILED EXECUTION REPORT including: 1. ✅ Task Understanding 2. 📋 Action Plan 3. 🎯 Execution Results 4. 📊 Metrics & Outcomes 5. 🚀 Next Steps 6. ⏱️ Timeline. Be specific and professional. Address King Solomon directly.`;
    } else if (agent.role.toLowerCase().includes('knowledge') || agent.role.toLowerCase().includes('librarian')) {
        specializedInstructions = `SPECIALIZATION: Knowledge Management & Research. Provide a COMPREHENSIVE RESEARCH REPORT including: 1. 📚 Research Summary 2. 🔍 Detailed Analysis 3. 💡 Key Insights 4. 📖 Sources & References 5. 🎓 Educational Value 6. 🚀 Recommendations. Be thorough and well-organized. Address King Solomon directly.`;
    } else if (agent.role.toLowerCase().includes('builder') || agent.role.toLowerCase().includes('engineer') || agent.role.toLowerCase().includes('software')) {
        specializedInstructions = `SPECIALIZATION: Software Engineering & Development. Provide a TECHNICAL EXECUTION REPORT including: 1. 🏗️ Technical Analysis 2. 📐 Architecture Design 3. 💻 Implementation Details 4. 🔧 Technical Specifications 5. ⚡ Performance Considerations 6. 🚀 Deployment Plan. Be technical and precise. Address King Solomon directly.`;
    } else {
        specializedInstructions = `SPECIALIZATION: ${agent.role}. Execute this task according to your role's expertise. Provide a comprehensive report. Address King Solomon directly.`;
    }

    return baseContext + specializedInstructions;
};

const createAndExecuteTask = async (req, res) => {
    try {
        const { title, description, assignedAgent, priority } = req.body;

        if (!title || !description || !assignedAgent) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, and agent'
            });
        }

        const agent = await Agent.findById(assignedAgent);
        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        const task = await Task.create({
            title,
            description,
            assignedAgent: agent._id,
            agentName: agent.name,
            agentRole: agent.role,
            priority: priority || 'Medium',
            status: 'In Progress',
            createdBy: req.user.id,
            createdByName: req.user.name,
            startedAt: Date.now()
        });

        await Agent.findByIdAndUpdate(assignedAgent, { status: 'Online' });

        console.log(`🤖 Executing task with ${agent.name} (${agent.role})`);
        
        // ✅ FIND SIMILAR MEMORIES
        let similarMemories = [];
        try {
            const keywords = extractKeywords(title + ' ' + description);
            if (keywords.length > 0) {
                similarMemories = await AgentMemory.find({
                    agentId: agent._id,
                    status: 'Completed',
                    $or: [
                        { keywords: { $in: keywords } },
                        { taskTitle: { $regex: keywords.join('|'), $options: 'i' } }
                    ]
                }).sort({ createdAt: -1 }).limit(5);
            }
            console.log(`💾 Found ${similarMemories.length} relevant memories for this task`);
        } catch (memError) {
            console.error('Memory lookup error:', memError);
        }
        
        const specializedPrompt = buildSpecializedPrompt(agent, title, description, similarMemories);
        const aiResult = await callDeepSeek(specializedPrompt);

        let taskResult;
        let taskStatus;

        if (aiResult.success) {
            taskResult = aiResult.response;
            taskStatus = 'Completed';
            await Agent.findByIdAndUpdate(assignedAgent, { status: 'Ready' });
        } else {
            taskResult = 'Task execution encountered an issue. Please retry or reassign.';
            taskStatus = 'Failed';
            await Agent.findByIdAndUpdate(assignedAgent, { status: 'Standby' });
        }

        const updatedTask = await Task.findByIdAndUpdate(
            task._id,
            { 
                result: taskResult,
                status: taskStatus,
                completedAt: Date.now()
            },
            { new: true }
        );

        // ✅ SAVE TO AGENT MEMORY
        await saveMemory(
            agent._id,
            agent.name,
            title,
            description,
            taskResult,
            taskStatus,
            req.user.id
        );

        await ActivityLog.create({
            actor: agent.name,
            action: `Completed task: "${title}"${similarMemories.length > 0 ? ` (referenced ${similarMemories.length} past memories)` : ''}`,
            status: taskStatus === 'Completed' ? 'Success' : 'Failed'
        });

        res.status(201).json({ 
            success: true, 
            message: 'Task executed successfully',
            data: updatedTask,
            memoryUsed: similarMemories.length
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper function (duplicated here to avoid circular dependency)
const extractKeywords = (text) => {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very']);
    
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word))
        .slice(0, 15);
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ 
            _id: req.params.id, 
            createdBy: req.user.id 
        });

        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: 'Task not found' 
            });
        }

        res.json({ success: true, message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    getUserTasks, 
    getAgentTasks, 
    createAndExecuteTask,
    deleteTask
};
