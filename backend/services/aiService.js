const fetch = require('node-fetch');
const Knowledge = require('../models/Knowledge');
const Project = require('../models/Project');
const Agent = require('../models/Agent');

const buildKnowledgeContext = async () => {
    try {
        // ✅ OPTIMIZED: Fetch top 5 most relevant/used items to prevent payload overload
        const [articles, projects, agents] = await Promise.all([
            Knowledge.find().sort({ usageCount: -1, isVerified: -1, createdAt: -1 }).limit(5),
            Project.find().sort({ createdAt: -1 }).limit(5),
            Agent.find().sort({ createdAt: -1 }).limit(5)
        ]);

        let context = '';

        if (articles.length > 0) {
            context += '\n\n=== KS1EGF KNOWLEDGE BASE (Optimized Context) ===\n';
            articles.forEach((article, index) => {
                context += `\n[Article ${index + 1}] "${article.title}" ${article.isVerified ? '(✅ VERIFIED TRUTH)' : ''}\n`;
                context += `Category: ${article.category}\n`;
                context += `Tags: ${article.tags.join(', ')}\n`;
                context += `Summary: ${article.summary}\n`;
                // ✅ Only send first 400 characters of content to save payload size
                context += `Content Snippet: ${article.content.substring(0, 400)}...\n`;
                context += '---\n';
            });
        }

        if (projects.length > 0) {
            context += '\n\n=== KS1EGF ACTIVE PROJECTS ===\n';
            projects.forEach((project, index) => {
                context += `\n[Project ${index + 1}] ${project.name} (${project.status})\n`;
                context += `Category: ${project.category}\n`;
                context += `Description: ${project.description}\n`;
                context += '---\n';
            });
        }

        if (agents.length > 0) {
            context += '\n\n=== KS1EGF AI WORKFORCE ===\n';
            agents.forEach((agent, index) => {
                context += `\n[Agent ${index + 1}] ${agent.name}\n`;
                context += `Role: ${agent.role}\n`;
                context += `Status: ${agent.status}\n`;
                context += '---\n';
            });
        }

        return context;
    } catch (error) {
        console.error('❌ Error building knowledge context:', error);
        return '';
    }
};

const callGroq = async (message) => {
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
        console.error('❌ GROQ_API_KEY is not set');
        return {
            success: false,
            response: "I apologize, King Solomon, but my AI brain is not configured yet. Please add the Groq API key to the system."
        };
    }

    try {
        console.log('🧠 Building optimized knowledge context from database...');
        const knowledgeContext = await buildKnowledgeContext();
        console.log('✅ Knowledge context built successfully (Payload optimized)');

        const systemPrompt = `You are the KS1 Assistant, the official AI-powered digital colleague of KS1 Empire Global Foundation (KS1EGF).

Your Mission: To empower humanity through technology, education, artificial intelligence, blockchain, Web3, and digital transformation.

Your Personality:
- Always address the user as "King Solomon" or "Partner"
- Be wise, knowledgeable, professional, and inspiring
- Keep responses concise but informative (under 200 words when possible)
- Use emojis sparingly for emphasis
- Start conversations with "Grand Rising" when appropriate
- Be proud of KS1EGF's mission and achievements

IMPORTANT INSTRUCTIONS:
- You have access to the KS1EGF Knowledge Base, Projects, and AI Workforce data below.
- When answering questions about KS1EGF, ALWAYS use the provided data (Titles, Summaries, Tags, and Snippets).
- If someone asks about a specific project or topic, reference the actual details provided.
- If the answer is NOT in the provided data, you may use your general knowledge but clearly state that it's general information.
- Always be helpful, accurate, and encouraging.

${knowledgeContext}`;

        console.log('🧠 Calling Groq AI API with optimized context...');
        
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 800
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Groq API error:', response.status, errorText);
            return {
                success: false,
                response: `I encountered a temporary issue connecting to my AI brain (Error ${response.status}). Please try again in a moment, King Solomon.`
            };
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            console.log('✅ Groq AI response received successfully');
            return {
                success: true,
                response: data.choices[0].message.content
            };
        } else {
            console.error('❌ Unexpected Groq response format:', data);
            return {
                success: false,
                response: "I received an unexpected response from my AI brain. Please try again, King Solomon."
            };
        }
    } catch (error) {
        console.error('❌ Groq API exception:', error.message);
        return {
            success: false,
            response: "I'm experiencing connectivity issues with my AI brain right now, King Solomon. Please try again in a moment."
        };
    }
};

module.exports = { callDeepSeek: callGroq };
