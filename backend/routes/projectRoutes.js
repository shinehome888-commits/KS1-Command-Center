const express = require('express');
const router = express.Router();
const { getProjects, createProject, deleteProject } = require('../controllers/projectController');

// Define the paths
router.route('/')
    .get(getProjects)      // GET /api/projects
    .post(createProject);  // POST /api/projects

// Add the delete route with an ID parameter
router.route('/:id')
    .delete(deleteProject); // DELETE /api/projects/:id

module.exports = router;
