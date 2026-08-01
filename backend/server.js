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
        const Knowledge = require('./models/Knowledge');

        await Project.deleteMany();
        await Agent.deleteMany();
        await Knowledge.deleteMany();

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
            {
                title: 'What is Artificial Intelligence?',
                category: 'AI',
                content: 'Artificial Intelligence (AI) is the simulation of human intelligence by machines. It includes learning, reasoning, problem-solving, and decision-making. AI powers everything from voice assistants to self-driving cars. At KS1EGF, we believe AI should serve humanity, not replace it.'
            },
            {
                title: 'Blockchain Explained Simply',
                category: 'Blockchain',
                content: 'Blockchain is a digital ledger that records transactions across many computers. Once data is recorded, it cannot be changed. This makes it secure and transparent. Bitcoin and Ethereum run on blockchain. KS1 Wallet and ALKEBULAN PAY are built on this technology.'
            },
            {
                title: 'What is Web3?',
                category: 'Technology',
                content: 'Web3 is the next generation of the internet. Unlike Web2 (social media, big tech), Web3 is decentralized. Users own their data, identity, and digital assets. It is built on blockchain technology and empowers individuals and communities.'
            },
            {
                title: 'Digital Transformation for Nonprofits',
                category: 'Business',
                content: 'Digital transformation means using technology to improve how an organization operates. For nonprofits, this means automating tasks, reaching more people, reducing costs, and increasing impact. KS1 Command Center is an example of digital transformation in action.'
            },
            {
                title: 'Introduction to Smart Contracts',
                category: 'Blockchain',
                content: 'A smart contract is a self-executing program stored on a blockchain. When certain conditions are met, the contract runs automatically without middlemen. They power DeFi, NFTs, and decentralized organizations (DAOs).'
            },
            {
                title: 'The Future of AI in Education',
                category: 'Education',
                content: 'AI is transforming education by personalizing learning, automating grading, and providing 24/7 tutoring. ShineGPT is KS1EGF\'s answer to making AI-powered education accessible to everyone, especially underserved communities across Africa and the diaspora.'
            }
        ]);

        res.json({ success: true, message: "✅ Database seeded with Projects, Agents, and Knowledge lessons!" });
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
