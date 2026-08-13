const mongoose = require('mongoose');

const KnowledgeSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Please provide a title'],
        trim: true
    },
    content: { 
        type: String, 
        required: [true, 'Please provide content']
    },
    summary: {
        type: String,
        default: ''
    },
    category: { 
        type: String, 
        required: true
    },
    tags: [{ 
        type: String 
    }],
    usageCount: { 
        type: Number, 
        default: 0 
    },
    isVerified: { 
        type: Boolean, 
        default: false 
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Knowledge', KnowledgeSchema);
