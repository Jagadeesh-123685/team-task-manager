# Team Task Manager

A full-stack MERN-style project manager. **No MongoDB, no cloud DB, no network issues.**

## Stack
- **Backend**: Node.js + Express + JWT auth + JSON file storage (`db.json`)
- **Frontend**: React 18 + Vite + React Router

## Quick Start

### 1. Backend
```bash
cd backend
npm install
npm start
# → http://localhost:5000
```

### 2. Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

## Environment Variables (`backend/.env`)
```
PORT=5000
JWT_SECRET=super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:5173
```

## API Endpoints

### Auth  `/api/auth`
| Method | Path | Body | Description |
|--------|------|------|-------------|
| POST | `/register` | name, email, password | Register user |
| POST | `/login` | email, password | Login, get JWT |
| GET | `/me` | — (auth header) | Get current user |

### Users  `/api/users`
| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List all users |
| GET | `/:id` | Get user by ID |

### Projects  `/api/projects`
| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/` | — | List all projects |
| POST | `/` | name, description | Create project |
| GET | `/:id` | — | Get project + tasks |
| PUT | `/:id` | name, description, status | Update project |
| DELETE | `/:id` | — | Delete project + tasks |

### Tasks  `/api/tasks`
| Method | Path | Body/Query | Description |
|--------|------|------|-------------|
| GET | `/` | `?project_id=X` | List tasks (optionally filtered) |
| POST | `/` | title, project_id, ... | Create task |
| GET | `/:id` | — | Get task |
| PUT | `/:id` | title, status, ... | Update task |
| DELETE | `/:id` | — | Delete task |

## Folder Structure
```
team-task-manager/
├── backend/
│   ├── db/
│   │   └── database.js       # JSON file storage engine
│   ├── middleware/
│   │   ├── auth.js           # JWT middleware
│   │   ├── errorHandler.js   # Global error handler
│   │   └── validate.js       # Field validation
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── .env
│   ├── db.json               # Auto-created on first run
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── api/client.js     # API helper
    │   ├── context/AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Dashboard.jsx
    │   │   └── ProjectDetail.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```
