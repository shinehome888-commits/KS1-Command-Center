require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./models/Project');
const Agent = require('./models/Agent');

const seedData = async () => {
    try {
        // Connect to your local or Atlas DB (ensure MONGO_URI is in your local .env)
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🟢 Connected to MongoDB for seeding...');

        // Clear any existing data to prevent duplicates
        await Project.deleteMany();
        await Agent.deleteMany();

        // Insert KS1 Projects
        const projects = [
            { name: 'ShineGPT', description: 'AI-powered education platform for humanity.', category: 'Education', status: 'Active' },
            { name: 'KS1 Wallet', description: 'Secure blockchain digital wallet infrastructure.', category: 'Blockchain', status: 'Planning' },
            { name: 'KS1 ALKEBULAN PAY', description: 'Digital trade infrastructure empowering Africa.', category: 'Digital Trade Infrastructure', status: 'Active' }
        ];
        await Project.insertMany(projects);

        // Insert KS1 AI Agents
        const agents = [
            { name: 'KS1 Operations Agent', role: 'Digital Operations Coordinator', status: 'Online' },
            { name: 'KS1 Knowledge Agent', role: 'Digital Librarian', status: 'Ready' },
            { name: 'KS1 Builder Agent', role: 'Software Engineer', status: 'Standby' }
        ];
        await Agent.insertMany(agents);

        console.log('✅ Database seeded successfully with KS1 Foundation data!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
