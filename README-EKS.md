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

---

# 🧭 EKS Dashboard & Cluster Management Guide

## 🧱 View Your Cluster on AWS EKS Console

1. Go to 👉 [https://console.aws.amazon.com/eks](https://console.aws.amazon.com/eks)
2. Make sure you’re in the **same region** (e.g., `ap-south-1`).
3. Click on your cluster name — e.g., `todo-cluster`
4. You’ll now see the **Cluster Overview** page:
   - Cluster status (Active/Deleting)
   - Kubernetes version
   - VPC & networking info
   - Node groups
   - Add-ons (CoreDNS, VPC CNI, kube-proxy)
5. Open the **Compute** tab → shows all **node groups (EC2 worker nodes)**

---

## 🧰 Check Cluster from CLI

### Check all clusters:
```bash
aws eks list-clusters --region ap-south-1
```

### Describe specific cluster:
```bash
aws eks describe-cluster --name todo-cluster --region ap-south-1
```

### Check node groups:
```bash
aws eks list-nodegroups --cluster-name todo-cluster --region ap-south-1
```

---

# ❌ Deleting Node Groups & Cluster

If you try to delete the cluster directly, you may see:
> **Cluster has nodegroups attached. You can delete nodegroups at the cluster's compute tab.**

That means you must delete node groups **before** deleting the cluster.

---

## 🟩 Option 1 — Delete via AWS Console
1. Go to [EKS Console](https://console.aws.amazon.com/eks)
2. Select your cluster → **Compute** tab
3. Select node groups → Click **Delete**
4. Wait until all node groups are gone
5. Then delete the cluster from **Cluster Overview** page

---

## 🟦 Option 2 — Delete via eksctl CLI

List node groups:
```bash
eksctl get nodegroup --cluster todo-cluster --region ap-south-1
```

Delete node groups:
```bash
eksctl delete nodegroup --cluster todo-cluster --region ap-south-1 --name <your-nodegroup-name>
```

Delete cluster:
```bash
eksctl delete cluster --name todo-cluster --region ap-south-1
```

---

## 🟨 Option 3 — Delete via AWS CLI

List node groups:
```bash
aws eks list-nodegroups --cluster-name todo-cluster --region ap-south-1
```

Delete node group:
```bash
aws eks delete-nodegroup --cluster-name todo-cluster --nodegroup-name <node-group-name> --region ap-south-1
```

Then delete cluster:
```bash
aws eks delete-cluster --name todo-cluster --region ap-south-1
```

---

# 🧹 Full Cleanup (Optional)

After deletion, AWS may leave behind:
- EC2 instances (temporarily)
- ELBs (from LoadBalancer services)
- EBS volumes (if used)

Check and delete from:
- **EC2 → Instances**
- **EC2 → Load Balancers**
- **EC2 → Volumes**

---

# 🧾 Ready-to-Run Cleanup Script

Create a script named **eks-delete-all.sh** and make it executable:
```bash
chmod +x eks-delete-all.sh
```

### Script:
```bash
#!/bin/bash
CLUSTER_NAME="todo-cluster"
REGION="ap-south-1"

echo "🧹 Deleting all nodegroups for $CLUSTER_NAME in $REGION..."
for ng in $(aws eks list-nodegroups --cluster-name $CLUSTER_NAME --region $REGION --query "nodegroups[]" --output text)
do
  echo "Deleting nodegroup: $ng"
  eksctl delete nodegroup --cluster $CLUSTER_NAME --region $REGION --name $ng --wait
done

echo "🧹 Deleting EKS cluster..."
eksctl delete cluster --name $CLUSTER_NAME --region $REGION

echo "✅ Cleanup completed successfully!"
```

Run:
```bash
./eks-delete-all.sh
```

---

# 🧠 Bonus: Enable EKS Dashboard Access

If you want a **visual Kubernetes Dashboard**:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
kubectl create serviceaccount dashboard-admin-sa
kubectl create clusterrolebinding dashboard-admin-sa --clusterrole=cluster-admin --serviceaccount=default:dashboard-admin-sa
```

Get access token:
```bash
kubectl get secret $(kubectl get sa dashboard-admin-sa -o jsonpath="{.secrets[0].name}") -o go-template="{{.data.token | base64decode}}"
```

Start proxy:
```bash
kubectl proxy
```

Open in browser:
```
http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/
```

Login with the token to access full dashboard 👨‍💻

---

# ✅ Summary

| Action | Method | Command |
|--------|---------|----------|
| View Cluster | AWS Console | [https://console.aws.amazon.com/eks](https://console.aws.amazon.com/eks) |
| Check Node Groups | CLI | `eksctl get nodegroup --cluster todo-cluster` |
| Delete Node Groups | CLI | `eksctl delete nodegroup --cluster todo-cluster` |
| Delete Cluster | CLI | `eksctl delete cluster --name todo-cluster` |
| Dashboard Access | Local Proxy | `kubectl proxy` |

---

🎯 **You now have:**
- A running EKS cluster with frontend, backend, and database  
- Full AWS dashboard access  
- A cleanup script for safe teardown  
- Optional Kubernetes Dashboard for visual management  

---

🧑‍💻 *Maintained by:* **Sai Chandra Reddy**  
*DevOps | Cloud | Full Stack Enthusiast*
