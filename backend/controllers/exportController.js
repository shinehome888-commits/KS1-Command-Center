const Project = require('../models/Project');
const Agent = require('../models/Agent');
const Knowledge = require('../models/Knowledge');
const Communication = require('../models/Communication');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');

const arrayToCSV = (data, headers) => {
    const csvRows = [];
    csvRows.push(headers.join(','));
    data.forEach(row => {
        const values = headers.map(header => {
            let value = row[header];
            if (value === null || value === undefined) value = '';
            if (value instanceof Date) value = value.toISOString();
            const escaped = ('' + value).replace(/"/g, '""').replace(/\n/g, ' ').replace(/\r/g, '');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    });
    return csvRows.join('\n');
};

const exportProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        const headers = ['name', 'description', 'category', 'status', 'createdAt'];
        const csv = arrayToCSV(projects, headers);
        res.header('Content-Type', 'text/csv');
        res.attachment('ks1-projects.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export projects error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const exportAgents = async (req, res) => {
    try {
        const agents = await Agent.find().sort({ createdAt: -1 });
        const headers = ['name', 'role', 'status', 'createdAt'];
        const csv = arrayToCSV(agents, headers);
        res.header('Content-Type', 'text/csv');
        res.attachment('ks1-agents.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export agents error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const exportKnowledge = async (req, res) => {
    try {
        const articles = await Knowledge.find().sort({ createdAt: -1 });
        const headers = ['title', 'category', 'content', 'createdAt'];
        const csv = arrayToCSV(articles, headers);
        res.header('Content-Type', 'text/csv');
        res.attachment('ks1-knowledge.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export knowledge error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const exportCommunications = async (req, res) => {
    try {
        const communications = await Communication.find().sort({ createdAt: -1 });
        const headers = ['title', 'category', 'priority', 'content', 'author', 'createdAt'];
        const csv = arrayToCSV(communications, headers);
        res.header('Content-Type', 'text/csv');
        res.attachment('ks1-communications.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export communications error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const exportTasks = async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        const headers = ['title', 'description', 'agentName', 'agentRole', 'status', 'priority', 'result', 'createdAt', 'completedAt'];
        const csv = arrayToCSV(tasks, headers);
        res.header('Content-Type', 'text/csv');
        res.attachment('ks1-tasks.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export tasks error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const exportActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ createdAt: -1 });
        const headers = ['actor', 'action', 'status', 'createdAt'];
        const csv = arrayToCSV(logs, headers);
        res.header('Content-Type', 'text/csv');
        res.attachment('ks1-activity-logs.csv');
        res.send(csv);
    } catch (error) {
        console.error('Export activity logs error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const exportAllData = async (req, res) => {
    try {
        const [projects, agents, knowledge, communications, tasks, logs] = await Promise.all([
            Project.find().sort({ createdAt: -1 }),
            Agent.find().sort({ createdAt: -1 }),
            Knowledge.find().sort({ createdAt: -1 }),
            Communication.find().sort({ createdAt: -1 }),
            Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 }),
            ActivityLog.find().sort({ createdAt: -1 })
        ]);

        const reportData = {
            generatedAt: new Date().toISOString(),
            summary: {
                totalProjects: projects.length,
                totalAgents: agents.length,
                totalKnowledge: knowledge.length,
                totalCommunications: communications.length,
                totalTasks: tasks.length,
                totalActivities: logs.length
            },
            projects,
            agents,
            knowledge,
            communications,
            tasks,
            activityLogs: logs
        };

        res.json({ success: true, data: reportData });
    } catch (error) {
        console.error('Export all data error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    exportProjects,
    exportAgents,
    exportKnowledge,
    exportCommunications,
    exportTasks,
    exportActivityLogs,
    exportAllData
};
