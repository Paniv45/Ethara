const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Task description is required'],
      trim: true,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['Todo', 'In-Progress', 'Completed'],
      default: 'Todo',
    },
    priority: {
      type: String,
      enum: ['Low', 'Med', 'High'],
      default: 'Med',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);
