const Knowledge = require('../models/Knowledge');
const { callDeepSeek } = require('../services/aiService');

const enrichKnowledgeWithAI = async (title, content) => {
    try {
        const prompt = `Analyze this knowledge base article and return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with exactly two fields:
1. "summary": A concise 2-sentence summary of the content.
2. "tags": An array of 3-5 relevant lowercase keywords/tags.

Article Title: "${title}"
Article Content: "${content.substring(0, 1500)}"

Return ONLY the JSON object.`;

        const result = await callDeepSeek(prompt);
        if (result.success) {
            const cleanJson = result.response
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .replace(/^[^{]*/, '')
                .replace(/[^}]*$/, '')
                .trim();
            const parsed = JSON.parse(cleanJson);
            return {
                summary: parsed.summary || content.substring(0, 150) + '...',
                tags: Array.isArray(parsed.tags) ? parsed.tags : ['general']
            };
        }
    } catch (error) {
        console.error('❌ AI enrichment failed:', error.message);
    }
    return { summary: content.substring(0, 150) + '...', tags: ['general'] };
};

const getAllKnowledge = async (req, res) => {
    try {
        const knowledge = await Knowledge.find().sort({ usageCount: -1, createdAt: -1 });
        res.json({ success: true, data: knowledge });
    } catch (error) {
        console.error('Get knowledge error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const createKnowledge = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide title, content, and category'
            });
        }

        console.log('🧠 Enriching knowledge with AI...');
        const enrichment = await enrichKnowledgeWithAI(title, content);
        console.log('✅ AI enrichment complete');

        const knowledge = await Knowledge.create({
            title,
            content,
            category,
            summary: enrichment.summary,
            tags: enrichment.tags,
            usageCount: 0,
            isVerified: false
        });

        res.status(201).json({ success: true, data: knowledge });
    } catch (error) {
        console.error('Create knowledge error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateKnowledge = async (req, res) => {
    try {
        const { title, content, category, isVerified } = req.body;
        const updateData = {};

        if (title !== undefined) updateData.title = title;
        if (category !== undefined) updateData.category = category;
        if (isVerified !== undefined) updateData.isVerified = isVerified;

        if (content !== undefined) {
            updateData.content = content;
            const enrichment = await enrichKnowledgeWithAI(title || 'Article', content);
            updateData.summary = enrichment.summary;
            updateData.tags = enrichment.tags;
        }

        const knowledge = await Knowledge.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!knowledge) {
            return res.status(404).json({ success: false, message: 'Knowledge not found' });
        }

        res.json({ success: true, data: knowledge });
    } catch (error) {
        console.error('Update knowledge error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteKnowledge = async (req, res) => {
    try {
        const knowledge = await Knowledge.findByIdAndDelete(req.params.id);
        if (!knowledge) {
            return res.status(404).json({ success: false, message: 'Knowledge not found' });
        }
        res.json({ success: true, message: 'Knowledge deleted successfully' });
    } catch (error) {
        console.error('Delete knowledge error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const incrementUsage = async (req, res) => {
    try {
        const knowledge = await Knowledge.findByIdAndUpdate(
            req.params.id,
            { $inc: { usageCount: 1 } },
            { new: true }
        );
        if (!knowledge) {
            return res.status(404).json({ success: false, message: 'Knowledge not found' });
        }
        res.json({ success: true, data: knowledge });
    } catch (error) {
        console.error('Increment usage error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const getKnowledgeInsights = async (req, res) => {
    try {
        const totalArticles = await Knowledge.countDocuments();
        const verifiedArticles = await Knowledge.countDocuments({ isVerified: true });
        const topUsed = await Knowledge.find().sort({ usageCount: -1 }).limit(5);
        const totalUsage = await Knowledge.aggregate([
            { $group: { _id: null, total: { $sum: '$usageCount' } } }
        ]);

        res.json({
            success: true,
            data: {
                totalArticles,
                verifiedArticles,
                totalUsage: totalUsage[0]?.total || 0,
                topUsed
            }
        });
    } catch (error) {
        console.error('Get insights error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { 
    getAllKnowledge, 
    createKnowledge, 
    updateKnowledge, 
    deleteKnowledge,
    incrementUsage,
    getKnowledgeInsights
};
