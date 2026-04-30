const express = require('express');
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('Admin'), createTask);
router.get('/project/:projectId', getTasksByProject);
router.patch('/:id', updateTask);
router.delete('/:id', authorizeRoles('Admin'), deleteTask);

module.exports = router;
