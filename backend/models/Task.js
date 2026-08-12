const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Please provide a task title'],
        trim: true
    },
    description: { 
        type: String, 
        required: [true, 'Please provide task details']
    },
    assignedAgent: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Agent',
        required: true
    },
    agentName: {
        type: String,
        required: true
    },
    agentRole: {
        type: String,
        required: true
    },
    status: { 
        type: String, 
        enum: ['Pending', 'In Progress', 'Completed', 'Failed'], 
        default: 'Pending' 
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    result: {
        type: String,
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdByName: {
        type: String,
        required: true
    },
    startedAt: {
        type: Date,
        default: null
    },
    completedAt: {
        type: Date,
        default: null
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Task', TaskSchema);
