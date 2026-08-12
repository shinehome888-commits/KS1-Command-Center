const Task = require('../models/Task');
const Agent = require('../models/Agent');
const { callDeepSeek } = require('../services/aiService');
const ActivityLog = require('../models/ActivityLog');

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

const buildSpecializedPrompt = (agent, title, description) => {
    const baseContext = `You are ${agent.name}, serving as ${agent.role} at KS1 Empire Global Foundation (KS1EGF).

KS1EGF Mission: To empower humanity through technology, education, artificial intelligence, blockchain, Web3, and digital transformation.

Active Projects:
- ShineGPT: AI-powered education platform
- KS1 Wallet: Secure blockchain digital wallet
- KS1 ALKEBULAN PAY: Digital trade infrastructure for Africa

YOUR TASK:
Title: ${title}
Details: ${description}

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
        
        const specializedPrompt = buildSpecializedPrompt(agent, title, description);
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

        await ActivityLog.create({
            actor: agent.name,
            action: `Completed task: "${title}"`,
            status: taskStatus === 'Completed' ? 'Success' : 'Failed'
        });

        res.status(201).json({ 
            success: true, 
            message: 'Task executed successfully',
            data: updatedTask 
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
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
