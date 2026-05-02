/**
 * JSON file database with in-memory fallback.
 * No native modules required — pure Node.js fs.
 */
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

let db = null; // in-memory state

function emptyDb() {
  return { users: [], projects: [], tasks: [], sequences: { users: 1, projects: 1, tasks: 1 } };
}

function load() {
  try {
    if (fs.existsSync(DB_PATH)) {
      db = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      // ensure sequences exist for old files
      if (!db.sequences) db.sequences = { users: (db.users.length || 0) + 1, projects: (db.projects.length || 0) + 1, tasks: (db.tasks.length || 0) + 1 };
    } else {
      db = emptyDb();
      save();
    }
    console.log('JSON file database ready:', DB_PATH);
  } catch (err) {
    console.warn('Could not load db.json, using in-memory:', err.message);
    db = emptyDb();
  }
}

function save() {
  try { fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2)); }
  catch (err) { console.warn('Could not persist db.json:', err.message); }
}

function nextId(table) {
  const id = db.sequences[table]++;
  save();
  return id;
}

function initDatabase() { load(); }

const dbHelpers = {
  // USERS
  createUser(data) {
    const user = { id: nextId('users'), name: data.name, email: data.email, password: data.password, role: data.role || 'member', created_at: new Date().toISOString() };
    db.users.push(user); save(); return user;
  },
  findUserByEmail(email) { return db.users.find(u => u.email === email) || null; },
  findUserById(id) {
    const u = db.users.find(u => u.id === +id);
    if (!u) return null;
    const { password, ...rest } = u; return rest;
  },
  getAllUsers() { return db.users.map(({ password, ...u }) => u); },

  // PROJECTS
  createProject(data) {
    const p = { id: nextId('projects'), name: data.name, description: data.description || '', owner_id: +data.owner_id, status: data.status || 'active', created_at: new Date().toISOString() };
    db.projects.push(p); save(); return p;
  },
  getAllProjects() {
    return db.projects.map(p => {
      const owner = db.users.find(u => u.id === p.owner_id);
      return { ...p, owner_name: owner ? owner.name : null };
    });
  },
  findProjectById(id) { return db.projects.find(p => p.id === +id) || null; },
  updateProject(id, data) {
    const idx = db.projects.findIndex(p => p.id === +id);
    if (idx === -1) return null;
    db.projects[idx] = { ...db.projects[idx], name: data.name, description: data.description, status: data.status };
    save(); return db.projects[idx];
  },
  deleteProject(id) {
    const idx = db.projects.findIndex(p => p.id === +id);
    if (idx === -1) return false;
    db.projects.splice(idx, 1);
    db.tasks = db.tasks.filter(t => t.project_id !== +id);
    save(); return true;
  },

  // TASKS
  createTask(data) {
    const t = { id: nextId('tasks'), title: data.title, description: data.description || '', status: data.status || 'todo', priority: data.priority || 'medium', project_id: +data.project_id, assignee_id: data.assignee_id ? +data.assignee_id : null, created_by: +data.created_by, due_date: data.due_date || null, created_at: new Date().toISOString() };
    db.tasks.push(t); save(); return t;
  },
  getTasksByProject(projectId) {
    return db.tasks.filter(t => t.project_id === +projectId).map(t => {
      const a = t.assignee_id ? db.users.find(u => u.id === t.assignee_id) : null;
      return { ...t, assignee_name: a ? a.name : null };
    });
  },
  getAllTasks() {
    return db.tasks.map(t => {
      const a = t.assignee_id ? db.users.find(u => u.id === t.assignee_id) : null;
      const p = db.projects.find(pr => pr.id === t.project_id);
      return { ...t, assignee_name: a ? a.name : null, project_name: p ? p.name : null };
    });
  },
  findTaskById(id) { return db.tasks.find(t => t.id === +id) || null; },
  updateTask(id, data) {
    const idx = db.tasks.findIndex(t => t.id === +id);
    if (idx === -1) return null;
    db.tasks[idx] = { ...db.tasks[idx], title: data.title, description: data.description || '', status: data.status, priority: data.priority, assignee_id: data.assignee_id ? +data.assignee_id : null, due_date: data.due_date || null };
    save(); return db.tasks[idx];
  },
  deleteTask(id) {
    const idx = db.tasks.findIndex(t => t.id === +id);
    if (idx === -1) return false;
    db.tasks.splice(idx, 1); save(); return true;
  },
  isMemory() { return false; },
};

module.exports = { initDatabase, dbHelpers };
