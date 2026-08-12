# Manifiestos Kubernetes del frontend — Azure AKS Cloud Native

Despliegue del frontend (Next.js 16 App Router) en el clúster de Kubernetes en Azure **AKS (`dimo3-aks`)** dentro del Grupo de Recursos `rg-dimo3-canada` y usando el Registro de Contenedores **Azure ACR (`dimo3canacr.azurecr.io`)**.

---

## 📁 Manifiestos Desplegados en Azure

| Archivo | Recurso | Para qué sirve |
|---|---|---|
| `namespace.yaml` | `Namespace dimo3` | Crea el namespace común del proyecto en AKS. |
| `configmap.yaml` | `ConfigMap frontend-config` | Configuración `BACKEND_URL=http://backend:3000`. |
| `deployment.yaml` | `Deployment frontend` | Define el Pod Next.js con imagen `dimo3canacr.azurecr.io/dimo-frontend:latest`. |
| `service.yaml` | `Service frontend` (ClusterIP) | Red interna del clúster AKS (puerto 3001). |
| `service-nodeport.yaml` | `Service frontend-nodeport` (NodePort) | Expone el puerto físico `30001` en los nodos de Azure. |
| `service-canary.yaml` | `Service frontend-canary` (Canary) | Enruta tráfico a versiones de prueba (Release A/B Testing). |
| `service-headless.yaml` | `Service frontend-headless` (Headless) | Servicio `clusterIP: None` para métricas/scraping. |
| `ingress.yaml` | `Ingress frontend` (Nginx) | Enruta tráfico HTTP desde Internet al frontend. |
| `hpa.yaml` | `HorizontalPodAutoscaler frontend-hpa` | Autoescala automáticamente de 1 a 5 pods según CPU/RAM. |
| `pdb.yaml` | `PodDisruptionBudget frontend-pdb` | Garantiza mínimo 1 Pod activo durante mantenimientos. |

---

## 🚀 Cómo aplicar en Azure AKS

```bash
# 1. Conectar kubectl a tu clúster de Azure AKS
az aks get-credentials --resource-group rg-dimo3-canada --name dimo3-aks --overwrite-existing

# 2. Aplicar todos los manifiestos
~/.local/bin/kubectl apply -f k8s/

# 3. Verificar los recursos en el namespace dimo3
~/.local/bin/kubectl get all,hpa,pdb,ingress -n dimo3
```

---

## 🔒 Integración Azure ACR + AKS

El clúster **`dimo3-aks`** está enlazado directamente a **`dimo3canacr`** mediante Managed Identity. No se requieren secretos manuales de Docker (`imagePullSecrets`) para descargar imágenes.

### Publicar la imagen a Azure ACR:
```bash
# Iniciar sesión en el ACR de Azure
az acr login --name dimo3canacr

# Construir y subir la imagen Docker
docker build -t dimo3canacr.azurecr.io/dimo-frontend:latest --build-arg BACKEND_URL=http://backend:3000 .
docker push dimo3canacr.azurecr.io/dimo-frontend:latest
```

---

## 🌐 Flujo de Tráfico en Azure

```
Usuario en Internet
       │
       ▼
Ingress (Nginx / Azure Application Gateway)
       │
       ▼
Service "frontend" (ClusterIP 3001)
       │
       ▼
Pod "frontend" (Next.js standalone) ── proxy /api/* ──▶ Service "backend" (3000)
```
