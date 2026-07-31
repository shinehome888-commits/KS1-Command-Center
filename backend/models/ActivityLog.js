const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    actor: { type: String, required: true }, // Who did it (e.g., "King Solomon" or "KS1 Operations Agent")
    action: { type: String, required: true }, // What they did (e.g., "Sent chat command")
    status: { type: String, enum: ['Success', 'Failed', 'Pending'], default: 'Success' }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
