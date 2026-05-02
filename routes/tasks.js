const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { dbHelpers } = require('../db/database');

router.get('/', auth, (req, res, next) => {
  try {
    const { project_id } = req.query;
    const tasks = project_id ? dbHelpers.getTasksByProject(project_id) : dbHelpers.getAllTasks();
    res.json(tasks);
  } catch (err) { next(err); }
});

router.post('/', auth, validate(['title', 'project_id']), (req, res, next) => {
  try {
    const { title, description, status, priority, project_id, assignee_id, due_date } = req.body;
    if (!dbHelpers.findProjectById(project_id)) return res.status(404).json({ error: 'Project not found' });
    const task = dbHelpers.createTask({ title, description: description||'', status: status||'todo', priority: priority||'medium', project_id: +project_id, assignee_id: assignee_id||null, created_by: req.user.id, due_date: due_date||null });
    res.status(201).json(task);
  } catch (err) { next(err); }
});

router.get('/:id', auth, (req, res, next) => {
  try {
    const task = dbHelpers.findTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) { next(err); }
});

router.put('/:id', auth, validate(['title']), (req, res, next) => {
  try {
    const task = dbHelpers.findTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    const { title, description, status, priority, assignee_id, due_date } = req.body;
    const updated = dbHelpers.updateTask(req.params.id, { title, description: description||'', status: status||task.status, priority: priority||task.priority, assignee_id: assignee_id||null, due_date: due_date||null });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, (req, res, next) => {
  try {
    const ok = dbHelpers.deleteTask(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) { next(err); }
});

module.exports = router;
