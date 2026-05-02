const router = require('express').Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { isAdmin } = require('../middleware/role'); // ✅ added
const { dbHelpers } = require('../db/database');

router.get('/', auth, (req, res, next) => {
  try { res.json(dbHelpers.getAllProjects()); }
  catch (err) { next(err); }
});

router.post('/', auth, isAdmin, validate(['name']), (req, res, next) => { // ✅ updated
  try {
    const { name, description, status } = req.body;
    const project = dbHelpers.createProject({
      name,
      description: description || '',
      owner_id: req.user.id,
      status: status || 'active'
    });
    res.status(201).json(project);
  } catch (err) { next(err); }
});

router.get('/:id', auth, (req, res, next) => {
  try {
    const project = dbHelpers.findProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const tasks = dbHelpers.getTasksByProject(req.params.id);
    res.json({ ...project, tasks });
  } catch (err) { next(err); }
});

router.put('/:id', auth, validate(['name']), (req, res, next) => {
  try {
    const project = dbHelpers.findProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });

    const updated = dbHelpers.updateProject(req.params.id, {
      name: req.body.name,
      description: req.body.description || '',
      status: req.body.status || project.status
    });

    res.json(updated);
  } catch (err) { next(err); }
});

router.delete('/:id', auth, (req, res, next) => {
  try {
    const ok = dbHelpers.deleteProject(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (err) { next(err); }
});

module.exports = router;