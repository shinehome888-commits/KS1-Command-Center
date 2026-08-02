const mongoose = require('mongoose');

const CommunicationSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Please provide a title'],
        trim: true
    },
    content: { 
        type: String, 
        required: [true, 'Please provide content'],
    },
    category: { 
        type: String, 
        enum: ['Announcement', 'News', 'Update', 'Event', 'Alert'], 
        default: 'Announcement' 
    },
    priority: {
        type: String,
        enum: ['Normal', 'High', 'Urgent'],
        default: 'Normal'
    },
    author: {
        type: String,
        default: 'King Solomon'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Communication', CommunicationSchema);
