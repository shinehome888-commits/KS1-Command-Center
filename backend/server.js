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

// API Routes - BASIC ONLY (AI will be added back later)
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/logs', require('./routes/activityRoutes'));
app.use('/api/knowledge', require('./routes/knowledgeRoutes'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
