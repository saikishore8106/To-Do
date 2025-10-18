# 🧩 TodoApp — FastAPI + React + PostgreSQL + Docker

A complete **Full Stack Todo Application** built with:

- 🐍 **FastAPI** for the backend
- ⚛️ **React** for the frontend
- 🐘 **PostgreSQL** as the database
- 🐳 **Docker** for containerization and deployment

---

## 🚀 Features

- Full CRUD (Create, Read, Update, Delete) Todos
- Backend API using FastAPI + SQLAlchemy
- PostgreSQL database for persistence
- React frontend served via Nginx
- Fully containerized (no Docker Compose)
- Ready for **local**, **EC2**, or **EKS** deployment

---

## 📁 Project Structure

```
todo-app/
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── package.json
│   ├── src/
│   ├── public/
│   ├── nginx.conf
│   └── Dockerfile
│
└── README.md
```

---

## ⚙️ Backend Setup (FastAPI)

### 🧱 Build Backend Docker Image

```bash
cd backend
docker build -t todo-backend .
```

### 🐘 Run PostgreSQL Container

```bash
docker run -d --name todo-db ^
  -e POSTGRES_USER=postgres ^
  -e POSTGRES_PASSWORD=1234 ^
  -e POSTGRES_DB=todo_db ^
  -p 5432:5432 ^
  postgres:15
```

### 🌐 Create Docker Network

```bash
docker network create todo-network
```

### 🔗 Connect Database to Network

```bash
docker network connect todo-network todo-db
```

### 🚀 Run Backend Container

```bash
docker run -d --name todo-backend ^
  --network todo-network ^
  -e DATABASE_URL=postgresql://postgres:1234@todo-db:5432/todo_db ^
  -p 8000:8000 ^
  todo-backend
```

🟢 FastAPI runs on [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🎨 Frontend Setup (React + Nginx)

### 🧱 Build Frontend Docker Image

```bash
cd ../frontend
docker build -t todo-frontend .
```

### 🧩 Example nginx.conf

```nginx
events {}
http {
  server {
    listen 80;

    location / {
      root /usr/share/nginx/html;
      index index.html;
      try_files $uri /index.html;
    }

    location /api/ {
      proxy_pass http://todo-backend:8000/;
    }
  }
}
```

### 🚀 Run Frontend Container

```bash
docker run -d --name todo-frontend ^
  --network todo-network ^
  -p 80:80 ^
  todo-frontend
```

🟢 React app runs on [http://localhost](http://localhost)

---

## 🔗 Docker Network Overview

| Service       | Container Name | Port | Hostname (inside Docker) | Purpose |
|----------------|----------------|------|---------------------------|----------|
| PostgreSQL     | `todo-db`      | 5432 | `todo-db`                 | Database |
| FastAPI Backend| `todo-backend` | 8000 | `todo-backend`            | API |
| React Frontend | `todo-frontend`| 80   | `todo-frontend`           | Web UI |

---

## 🧪 Verify Everything Works

### ✅ List Containers
```bash
docker ps
```

### ✅ Check Backend Logs
```bash
docker logs todo-backend
```

### ✅ Inspect Docker Network
```bash
docker network inspect todo-network
```

### ✅ Access URLs
| Service | URL |
|----------|------|
| Frontend | [http://localhost](http://localhost) |
| Backend  | [http://localhost:8000/docs](http://localhost:8000/docs) |

---

## 🧱 Run All in One Go (for Demos)

```bash
docker network create todo-network

docker run -d --name todo-db --network todo-network ^
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=1234 -e POSTGRES_DB=todo_db ^
  -p 5432:5432 postgres:15

docker run -d --name todo-backend --network todo-network ^
  -e DATABASE_URL=postgresql://postgres:1234@todo-db:5432/todo_db ^
  -p 8000:8000 todo-backend

docker run -d --name todo-frontend --network todo-network -p 80:80 todo-frontend
```

✅ Now open:
- Frontend → [http://localhost](http://localhost)
- Backend → [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ☁️ Deploying to EC2 (Manual)

1. Install Docker on EC2:
   ```bash
   sudo apt update && sudo apt install docker.io -y
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

2. Pull your Docker images:
   ```bash
   docker pull yourdockerhubusername/todo-backend
   docker pull yourdockerhubusername/todo-frontend
   ```

3. Run the same three commands above (DB + Backend + Frontend)

4. Open EC2 Security Group ports:
   - 80 → Frontend
   - 8000 → Backend (optional)
   - 5432 → Postgres (optional for remote access)

---

## 🐳 Common Docker Commands

| Command | Description |
|----------|--------------|
| `docker ps` | List running containers |
| `docker stop <name>` | Stop container |
| `docker rm <name>` | Remove container |
| `docker logs <name>` | View container logs |
| `docker build -t name .` | Build image |
| `docker run -d --name name image` | Run container |
| `docker network ls` | List networks |
| `docker network connect net container` | Connect container to network |

---

## 📦 Push Images to Docker Hub

```bash
docker login
docker tag todo-backend yourdockerhubusername/todo-backend
docker tag todo-frontend yourdockerhubusername/todo-frontend
docker push yourdockerhubusername/todo-backend
docker push yourdockerhubusername/todo-frontend
```

---

## ✨ Tech Stack

| Layer | Technology |
|--------|-------------|
| Frontend | React + Nginx |
| Backend | FastAPI + SQLAlchemy |
| Database | PostgreSQL |
| Container | Docker |
| Deployment | EC2 / EKS Ready |

---

## 👨‍💻 Author

**Your Name**  
GitHub: [@yourgithubusername](https://github.com/yourgithubusername)  
YouTube: [@yourchannelname](https://youtube.com/@yourchannelname)

---

### ✅ Summary

| URL | Description |
|------|-------------|
| [http://localhost](http://localhost) | React Frontend |
| [http://localhost:8000/docs](http://localhost:8000/docs) | FastAPI Docs |
| PostgreSQL | Persistent DB for Todos |

🎉 **Everything is now containerized and production-ready!**
