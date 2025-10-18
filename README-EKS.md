# 🚀 To-Do App Deployment on AWS EKS using Docker Hub Images

This guide explains how to deploy a **full-stack To-Do App** (React Frontend + FastAPI Backend + PostgreSQL Database) on **Amazon EKS (Elastic Kubernetes Service)** using **Docker Hub images**.

---

## 🧩 Project Architecture

EKS Cluster (AWS)
│
├── frontend-service (LoadBalancer)
│    └── React + Nginx container
│
├── backend-service (ClusterIP)
│    └── FastAPI + SQLAlchemy container
│
└── postgres-service (ClusterIP)
     └── PostgreSQL 17 container

---

## ⚙️ Prerequisites

Make sure you have:

| Tool | Description | Check Command |
|------|--------------|---------------|
| AWS CLI | Manage AWS | `aws --version` |
| kubectl | Control Kubernetes cluster | `kubectl version --client` |
| eksctl | Create EKS clusters | `eksctl version` |
| Docker | Build & push images | `docker --version` |

✅ Ensure you are logged in to AWS:
```bash
aws configure
```

✅ Ensure your Docker images are pushed to Docker Hub:
```
saichandravuta/frontend:latest
saichandravuta/backend:latest
```

---

## 🏗️ Step 1: Create EKS Cluster

```bash
eksctl create cluster   --name todo-cluster   --region ap-south-1   --node-type t3.medium   --nodes 2
```

Wait 10–15 minutes for the cluster to be ready.

---

## 🧠 Step 2: Connect kubectl

```bash
aws eks update-kubeconfig --region ap-south-1 --name todo-cluster
```

Check connectivity:
```bash
kubectl get nodes
```

---

## 🗄️ Step 3: Create Database (PostgreSQL)

### **postgres-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:17
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_USER
              value: "postgres"
            - name: POSTGRES_PASSWORD
              value: "1234"
            - name: POSTGRES_DB
              value: "todo_db"
---
apiVersion: v1
kind: Service
metadata:
  name: postgres-service
spec:
  selector:
    app: postgres
  ports:
    - protocol: TCP
      port: 5432
      targetPort: 5432
  type: ClusterIP
```

Apply:
```bash
kubectl apply -f postgres-deployment.yaml
```

---

## ⚙️ Step 4: Deploy Backend (FastAPI)

### **backend-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: saichandravuta/backend:latest
          ports:
            - containerPort: 8000
          env:
            - name: DATABASE_URL
              value: "postgresql://postgres:1234@postgres-service:5432/todo_db"
---
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 8000
      targetPort: 8000
  type: ClusterIP
```

Apply:
```bash
kubectl apply -f backend-deployment.yaml
```

Check logs:
```bash
kubectl logs -l app=backend
```

---

## 💻 Step 5: Deploy Frontend (React + Nginx)

### **frontend-deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
        - name: frontend
          image: saichandravuta/frontend:latest
          ports:
            - containerPort: 80
          env:
            - name: REACT_APP_API_URL
              value: "http://backend-service:8000"
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: LoadBalancer
```

Apply:
```bash
kubectl apply -f frontend-deployment.yaml
```

---

## 🌍 Step 6: Get LoadBalancer URL

```bash
kubectl get svc frontend-service
```

Example output:
```
NAME               TYPE           CLUSTER-IP      EXTERNAL-IP                                                                PORT(S)        AGE
frontend-service   LoadBalancer   10.100.43.240   a281be0b80b8146768531971f9043564-1565782294.ap-south-1.elb.amazonaws.com   80:30462/TCP   2m
```

Access your app at:
```
http://a281be0b80b8146768531971f9043564-1565782294.ap-south-1.elb.amazonaws.com
```

🎉 You should see your React frontend communicating with the FastAPI backend and PostgreSQL database.

---

## 🧠 Step 7: Verify Everything

```bash
kubectl get all
kubectl get pods -o wide
kubectl get svc
```

Check frontend access inside cluster:
```bash
kubectl exec -it $(kubectl get pod -l app=frontend -o jsonpath="{.items[0].metadata.name}") -- sh
curl http://backend-service:8000
```

You should get a response from FastAPI.

---

## 🧩 Step 8: Cleanup Resources

When done testing:
```bash
eksctl delete cluster --name todo-cluster --region ap-south-1
```

---

## 🧰 Optional Enhancements

✅ Use **AWS RDS** instead of in-cluster PostgreSQL  
✅ Add **Ingress + ACM Certificate** for HTTPS  
✅ Store credentials in **Kubernetes Secrets**  
✅ Automate builds with **GitHub Actions CI/CD**  
✅ Add **Horizontal Pod Autoscaling (HPA)**  

---

## 📁 Folder Structure Example

```
eksyamls/
│
├── postgres-deployment.yaml
├── backend-deployment.yaml
└── frontend-deployment.yaml
```

---

## 🏁 Final Output

| Component | Type | Status | URL |
|------------|------|--------|------|
| **Frontend** | LoadBalancer | ✅ Running | Public ELB URL |
| **Backend** | ClusterIP | ✅ Running | Internal only |
| **Postgres** | ClusterIP | ✅ Running | Internal only |

---

## 🏆 Congratulations!

You have successfully deployed a **Dockerized Full-Stack App** (React + FastAPI + PostgreSQL) on **Amazon EKS** using **Docker Hub images** 🎯

---

### 👨‍💻 Author
**Sai Chandra Reddy**  
Full Stack | DevOps | Cloud Enthusiast
