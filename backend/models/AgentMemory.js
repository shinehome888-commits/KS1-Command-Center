const mongoose = require('mongoose');

const AgentMemorySchema = new mongoose.Schema({
    agentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Agent', 
        required: true 
    },
    agentName: { 
        type: String, 
        required: true 
    },
    taskTitle: { 
        type: String, 
        required: true 
    },
    taskDescription: { 
        type: String, 
        required: true 
    },
    taskResult: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Completed', 'Failed'], 
        required: true 
    },
    category: { 
        type: String, 
        default: 'General' 
    },
    keywords: [{ 
        type: String 
    }],
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Index for faster search
AgentMemorySchema.index({ agentId: 1, taskTitle: 'text', taskDescription: 'text', keywords: 1 });

module.exports = mongoose.model('AgentMemory', AgentMemorySchema);
