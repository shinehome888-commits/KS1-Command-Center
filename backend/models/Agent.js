const mongoose = require('mongoose');

const AgentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, enum: ['Online', 'Ready', 'Standby', 'Offline'], default: 'Standby' }
}, { timestamps: true });

module.exports = mongoose.model('Agent', AgentSchema);
