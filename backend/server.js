const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

// --- BULLETPROOF CORS CONFIGURATION ---
app.use(cors({
    origin: ['https://ks1-command-center.pages.dev', 'http://localhost:3000', 'http://localhost:5500', '*'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// --------------------------------------

app.use(express.json());

// Base Route
app.get('/', (req, res) => {
    res.json({ message: 'KS1 Command Center API is Operational', status: 'success' });
});

// API Routes
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/logs', require('./routes/activityRoutes'));
app.use('/api/knowledge', require('./routes/knowledgeRoutes'));

// --- TEMPORARY SEED ROUTE ---
app.get('/api/seed', async (req, res) => {
    try {
        const Project = require('./models/Project');
        const Agent = require('./models/Agent');

        await Project.deleteMany();
        await Agent.deleteMany();

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

        res.json({ success: true, message: "✅ Database successfully seeded with KS1 data!" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
// ----------------------------

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
