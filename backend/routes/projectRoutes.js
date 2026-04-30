const express = require('express');
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignMembers,
} = require('../controllers/projectController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorizeRoles('Admin'), createProject);
router.put('/:id', authorizeRoles('Admin'), updateProject);
router.delete('/:id', authorizeRoles('Admin'), deleteProject);
router.patch('/:id/members', authorizeRoles('Admin'), assignMembers);

module.exports = router;
