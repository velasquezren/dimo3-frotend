# Manifiestos Kubernetes del frontend

Despliegue del frontend (Next.js) en el cluster EKS `dimo3-eks`. Estos manifiestos **no gestionan** el cluster (eso vive en `dimo3-infra` con Terraform); solo describen cómo correr el frontend dentro del cluster.

---

## 📁 Archivos

| Archivo | Recurso | Para qué sirve |
|---|---|---|
| `namespace.yaml` | `Namespace dimo3` | Crea el namespace común del proyecto (idempotente). |
| `configmap.yaml` | `ConfigMap frontend-config` | Documenta el contrato `BACKEND_URL=http://backend:3000`. |
| `deployment.yaml` | `Deployment frontend` | Define el pod Next.js (imagen, probes, resources, security). |
| `service.yaml` | `Service frontend` (ClusterIP) | Expone el Deployment dentro del cluster. |
| `ingress.yaml` | `Ingress frontend` (ALB) | Crea un ALB en AWS que enruta internet → frontend. |

---

## 🚀 Cómo aplicar

```bash
# Configurar kubectl contra el cluster (una sola vez)
aws eks update-kubeconfig --name dimo3-eks --region us-east-1

# Aplicar todos los manifiestos
kubectl apply -f k8s/

# Verificar
kubectl get pods -n dimo3 -l app.kubernetes.io/name=frontend
kubectl get svc -n dimo3 frontend
kubectl get ingress -n dimo3 frontend
```

---

## ⚠️ Prerrequisitos (importante leer antes de aplicar)

### 1. AWS Load Balancer Controller instalado en el cluster

Sin este controller, el `Ingress` **nunca crea el ALB** (queda en estado pendiente forever). Instalarlo es un paso previo fuera de este repo. Ver [`dimo3-infra/docs/K8S-DEPLOYMENT.md`](../../dimo3-infra/docs/K8S-DEPLOYMENT.md) o la [documentación oficial del AWS LB Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/deploy/installation/).

### 2. Imagen en ECR

El Deployment referencia `324486142059.dkr.ecr.us-east-1.amazonaws.com/dimo-frontend:latest`. Esa imagen **debe existir** en el ECR `dimo-frontend` antes de aplicar los manifiestos, si no el pod queda en `ImagePullBackOff`.

**Cómo llenar el ECR**: el pipeline del frontend (`azure-pipelines.yml`) hace build + push automáticamente. Antes de correrlo:

- Verificar que el variable group `Frontend-Terraform` tenga `BACKEND_URL_PRODUCTION=http://backend:3000` (no la URL vieja del ECS).
- Recrear el pipeline en Azure DevOps (Pipelines → New pipeline → seleccionar este repo).
- Correr el pipeline sobre `main`.

Sin este paso, la imagen no existe y el pod no arranca.

### 3. Backend desplegado en el cluster

El frontend proxyea `/api/*` a `http://backend:3000` (Service DNS interno). Eso requiere que el equipo del backend tenga desplegado:

- `Service backend` (puerto 3000) en namespace `dimo3`.
- `Deployment backend` que exponga los pods.

Sin eso, el frontend **sirve HTML** (las páginas cargan) pero las llamadas `/api/*` fallan con 502/connection refused. **Esperable hasta que el backend esté listo.**

### 4. Cluster EKS con nodos Ready

```bash
kubectl get nodes   # 2 nodos Ready (t3.micro)
```

Si esto no responde, el cluster todavía no está listo. Ver [`dimo3-infra`](../../dimo3-infra/) para crear el cluster con Terraform.

---

## 🔍 Estado esperado tras aplicar (con todos los prerrequisitos)

```
$ kubectl get pods -n dimo3 -l app.kubernetes.io/name=frontend
NAME                        READY   STATUS    RESTARTS   AGE
frontend-<hash>-<id>        1/1     Running   0          2m

$ kubectl get ingress -n dimo3 frontend
NAME       CLASS   HOSTS   ADDRESS                                         PORTS   AGE
frontend   alb     *       k8s-dimo3-frontend-xxxx.us-east-1.elb.amazonaws.com   80      3m
```

El `ADDRESS` del Ingress es la URL pública del ALB. Abrí esa URL en el navegador → debería cargar el frontend (HTML). Las llamadas a `/api/*` solo funcionarán cuando el backend esté desplegado.

---

## 🌐 Flujo de tráfico

```
Internet
   │
   ▼
ALB (creado por Ingress, gestionado por AWS LB Controller)
   │  http://k8s-dimo3-frontend-xxxx.us-east-1.elb.amazonaws.com
   ▼
Service "frontend" (ClusterIP, puerto 3001)
   │  (selector: app.kubernetes.io/name=frontend)
   ▼
Pod "frontend" (Next.js standalone)
   │
   ├── Sirve páginas HTML en /
   │
   └── Proxy /api/* → http://backend:3000
                              │
                              ▼
                  Service "backend" (Namespace dimo3)
                              │
                              ▼
                        Pod backend
                              │
                              ▼
                     Service "postgres"
                              │
                              ▼
                     StatefulSet postgres
```

---

## 🛠️ Operaciones comunes

### Ver logs del frontend
```bash
kubectl logs -n dimo3 deployment/frontend -f
```

### Hacer port-forward temporal (sin usar el ALB)
```bash
kubectl port-forward -n dimo3 svc/frontend 3001:3001
# Abrir http://localhost:3001 en el navegador
```

### Reiniciar el pod (rolling)
```bash
kubectl rollout restart -n dimo3 deployment/frontend
```

### Actualizar la imagen (cuando salga una nueva versión en ECR)
```bash
kubectl set image -n dimo3 deployment/frontend \
  frontend=324486142059.dkr.ecr.us-east-1.amazonaws.com/dimo-frontend:<nuevo-tag>
```

### Escalar réplicas
```bash
kubectl scale -n dimo3 deployment/frontend --replicas=2
```

---

## 🗑️ Borrar el frontend del cluster (sin tocar el resto)

```bash
kubectl delete -f k8s/    # borra los 5 recursos (no el namespace si ya tenía cosas)
# o específico:
kubectl delete -n dimo3 deployment frontend
kubectl delete -n dimo3 service frontend
kubectl delete -n dimo3 ingress frontend
kubectl delete -n dimo3 configmap frontend-config
# El namespace "dimo3" se mantiene si el backend/DB lo están usando.
```

---

## 🔗 Documentación relacionada

- [`dimo3-infra`](../../dimo3-infra/) — Terraform del cluster EKS + VPC + ECR + IAM.
- [`dimo3-infra/docs/K8S-DEPLOYMENT.md`](../../dimo3-infra/docs/K8S-DEPLOYMENT.md) — guía general de despliegue en el cluster.
- [AWS Load Balancer Controller](https://kubernetes-sigs.github.io/aws-load-balancer-controller/latest/) — docs oficiales del controller que materializa el Ingress en un ALB.

---

## 📋 Acuerdos con el equipo del backend

Estos nombres **deben coincidir** entre los manifiestos del frontend (este repo) y del backend (`dimo3-backend/k8s/`, futuro):

| Recurso | Nombre acordado | Puerto |
|---|---|---|
| Namespace | `dimo3` | — |
| Service del backend | `backend` | 3000 |
| Service de PostgreSQL | `postgres` | 5432 |

Si el equipo del backend usa otros nombres, ajustar `BACKEND_URL` en `configmap.yaml` y reconstruir la imagen del frontend con el nuevo `--build-arg`.
