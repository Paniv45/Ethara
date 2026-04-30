const Task = require('../models/Task');
const Project = require('../models/Project');

const getDashboardSummary = async (req, res, next) => {
  try {
    const taskFilter = req.user.role === 'Admin'
      ? {}
      : { assignedTo: req.user._id };

    const tasks = await Task.find(taskFilter).select('status dueDate');
    const now = new Date();

    const summary = {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter((task) => task.status !== 'Completed').length,
      overdueTasks: tasks.filter(
        (task) => task.status !== 'Completed' && new Date(task.dueDate) < now
      ).length,
    };

    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};
