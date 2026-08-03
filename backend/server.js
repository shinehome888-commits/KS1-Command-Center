const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'KS1 Command Center API is Operational', status: 'success' });
});

// API Routes
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/knowledge', require('./routes/knowledgeRoutes'));
app.use('/api/logs', require('./routes/activityRoutes'));
app.use('/api/communications', require('./routes/communicationRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes')); // NEW: Conversation History
app.use('/api/auth', require('./routes/authRoutes'));

// AI route - now with optional authentication
const { chatWithAI } = require('./controllers/aiController');
const { protect } = require('./middleware/auth');

// Make AI chat work with or without auth (optional auth)
app.post('/api/ai/chat', async (req, res, next) => {
    // Try to authenticate if token exists, but don't fail if it doesn't
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const User = require('./models/User');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Token invalid, continue without user
        }
    }
    next();
}, chatWithAI);

// Seed Route
app.get('/api/seed', async (req, res) => {
    try {
        const Project = require('./models/Project');
        const Agent = require('./models/Agent');
        const Knowledge = require('./models/Knowledge');
        const ActivityLog = require('./models/ActivityLog');

        await Project.deleteMany();
        await Agent.deleteMany();
        await Knowledge.deleteMany();
        await ActivityLog.deleteMany();

        await Project.insertMany([
            { name: 'ShineGPT', description: 'AI-powered education platform for humanity.', category: 'Education', status: 'Active' },
            { name: 'KS1 Wallet', description: 'Secure blockchain digital wallet infrastructure.', category: 'Blockchain', status: 'Planning' },
            { name: 'KS1 ALKEBULAN PAY', description: 'Digital trade infrastructure empowering Africa.', category: 'Digital Trade Infrastructure', status: 'Active' }
        ]);

        await Agent.insertMany([
            { name: 'KS1 Operations Agent', role: 'Digital Operations Coordinator', status: 'Online' },
            { name: 'KS1 Knowledge Agent', role: 'Digital Librarian', status: 'Ready' },
            { name: 'KS1 Builder Agent', role: 'Software Engineer', status: 'Standby' }
        ]);

        await Knowledge.insertMany([
            { title: 'What is Artificial Intelligence?', category: 'AI', content: 'Artificial Intelligence (AI) is the simulation of human intelligence by machines. It includes learning, reasoning, problem-solving, and decision-making.' },
            { title: 'Blockchain Explained Simply', category: 'Blockchain', content: 'Blockchain is a digital ledger that records transactions across many computers. Once data is recorded, it cannot be changed.' }
        ]);

        await ActivityLog.insertMany([
            { actor: 'System', action: 'Initialized KS1 Command Center v0.1', status: 'Success' },
            { actor: 'King Solomon', action: 'Logged into the Command Center', status: 'Success' }
        ]);

        res.json({ success: true, message: "✅ Database seeded successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
