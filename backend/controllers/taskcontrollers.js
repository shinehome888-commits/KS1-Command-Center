const Task = require('../models/Task');
const Agent = require('../models/Agent');
const { callDeepSeek } = require('../services/aiService');
const ActivityLog = require('../models/ActivityLog');

// GET all tasks for the user
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

// GET tasks by agent
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

// POST create and execute task
const createAndExecuteTask = async (req, res) => {
    try {
        const { title, description, assignedAgent, priority } = req.body;

        if (!title || !description || !assignedAgent) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, description, and agent'
            });
        }

        // Get agent details
        const agent = await Agent.findById(assignedAgent);
        if (!agent) {
            return res.status(404).json({
                success: false,
                message: 'Agent not found'
            });
        }

        // Create the task
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

        // Update agent status to Online
        await Agent.findByIdAndUpdate(assignedAgent, { status: 'Online' });

        // Execute the task with AI
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

        // Update task with result
        const updatedTask = await Task.findByIdAndUpdate(
            task._id,
            { 
                result: taskResult,
                status: taskStatus,
                completedAt: Date.now()
            },
            { new: true }
        );

        // Log the activity
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

// Build specialized prompt based on agent role
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
        specializedInstructions = `
SPECIALIZATION: Digital Operations & Coordination
As the Operations Coordinator, execute this task with focus on:
- Scheduling, coordination, and workflow optimization
- Process automation and efficiency
- Team coordination and resource allocation
- Project management and timeline planning

Provide a DETAILED EXECUTION REPORT including:
1. ✅ Task Understanding (what you understood)
2. 📋 Action Plan (step-by-step approach)
3. 🎯 Execution Results (what was accomplished)
4. 📊 Metrics & Outcomes (measurable results)
5. 🚀 Next Steps (recommendations)
6. ⏱️ Timeline (when things will happen)

Be specific, actionable, and professional. Address King Solomon directly.`;
    } else if (agent.role.toLowerCase().includes('knowledge') || agent.role.toLowerCase().includes('librarian')) {
        specializedInstructions = `
SPECIALIZATION: Knowledge Management & Research
As the Digital Librarian, execute this task with focus on:
- Research and information gathering
- Knowledge organization and documentation
- Data analysis and insights
- Educational content creation

Provide a COMPREHENSIVE RESEARCH REPORT including:
1. 📚 Research Summary (key findings)
2. 🔍 Detailed Analysis (in-depth breakdown)
3. 💡 Key Insights (actionable takeaways)
4. 📖 Sources & References (where info comes from)
5. 🎓 Educational Value (what we learned)
6. 🚀 Recommendations (how to apply this knowledge)

Be thorough, well-organized, and cite your reasoning. Address King Solomon directly.`;
    } else if (agent.role.toLowerCase().includes('builder') || agent.role.toLowerCase().includes('engineer') || agent.role.toLowerCase().includes('software')) {
        specializedInstructions = `
SPECIALIZATION: Software Engineering & Development
As the Software Engineer, execute this task with focus on:
- Code development and implementation
- Technical architecture and design
- System integration and optimization
- Bug fixing and feature building

Provide a TECHNICAL EXECUTION REPORT including:
1. 🏗️ Technical Analysis (what needs to be built)
2. 📐 Architecture Design (how it will be structured)
3. 💻 Implementation Details (code/approach)
4. 🔧 Technical Specifications (requirements)
5. ⚡ Performance Considerations (optimization)
6. 🚀 Deployment Plan (how to ship it)
7. 📝 Code Samples (if applicable)

Be technical, precise, and solution-oriented. Address King Solomon directly.`;
    } else {
        specializedInstructions = `
SPECIALIZATION: ${agent.role}
Execute this task according to your role's expertise.

Provide a comprehensive execution report including:
1. Task Understanding
2. Action Plan
3. Execution Results
4. Recommendations
5. Next Steps

Address King Solomon directly.`;
    }

    return baseContext + specializedInstructions;
};

// DELETE task
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
