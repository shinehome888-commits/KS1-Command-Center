const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ['Active', 'Completed', 'Paused', 'Planning'], default: 'Planning' }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);
