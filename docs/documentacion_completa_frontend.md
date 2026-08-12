# 📘 Documentación Completa del Frontend — dimo3-frontend

**Proyecto:** DIMO · Centro de Control  
**Tecnología:** Next.js 16 (App Router) + TypeScript + TailwindCSS  
**Puerto:** 3001  
**Repositorio:** `dimo3-frontend`  
**Namespace en Kubernetes:** `dimo3`

---

## 📑 Tabla de Contenidos

1. [¿Qué es este proyecto?](#1-qué-es-este-proyecto)
2. [Estructura de archivos y carpetas](#2-estructura-de-archivos-y-carpetas)
3. [¿Qué hace el código? (Explicación de cada archivo)](#3-qué-hace-el-código)
4. [Docker: Del código al contenedor](#4-docker-del-código-al-contenedor)
5. [Kubernetes: Conceptos clave explicados](#5-kubernetes-conceptos-clave-explicados)
6. [¿Dónde está el Pod?](#6-dónde-está-el-pod)
7. [¿Dónde están los Servicios?](#7-dónde-están-los-servicios)
8. [Manifiestos K8s: Archivo por archivo](#8-manifiestos-k8s-archivo-por-archivo)
9. [Flujo completo: Del código al usuario](#9-flujo-completo-del-código-al-usuario)
10. [CI/CD Pipeline (Azure Pipelines)](#10-cicd-pipeline)
11. [Comandos útiles](#11-comandos-útiles)
12. [Glosario de términos](#12-glosario-de-términos)

---

## 1. ¿Qué es este proyecto?

**DIMO** es un sistema de gestión comercial (CRM) que permite administrar:
- 👥 **Clientes**: Registro, edición y desactivación.
- 📦 **Productos**: Gestión de inventario con stock y precios.
- 📋 **Pedidos**: Creación y control de estados (PENDING → CONFIRMED → DELIVERED / CANCELLED).

La arquitectura completa tiene **3 microservicios**:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   🎨 Frontend   │────▶│   ⚙️ Backend    │────▶│   🗄️ PostgreSQL │
│   (Next.js)     │     │   (Express.js)  │     │   (Base de Datos)│
│   Puerto: 3001  │     │   Puerto: 3000  │     │   Puerto: 5432  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
    TÚ ESTÁS AQUÍ
```

---

## 2. Estructura de archivos y carpetas

```
dimo3-frontend/
│
├── app/                          # 🎨 PÁGINAS DE LA APLICACIÓN (Next.js App Router)
│   ├── layout.tsx                #    Layout principal (Sidebar + fuentes + CSS global)
│   ├── page.tsx                  #    Página de inicio (Dashboard con contadores)
│   ├── globals.css               #    Estilos CSS globales (tema oscuro, colores, tipografía)
│   ├── favicon.ico               #    Ícono de la pestaña del navegador
│   ├── clientes/                 #    Módulo de Clientes
│   │   ├── page.tsx              #       Lista de clientes
│   │   ├── nuevo/page.tsx        #       Formulario de crear cliente
│   │   └── [id]/page.tsx         #       Editar cliente por ID
│   ├── productos/                #    Módulo de Productos
│   │   ├── page.tsx              #       Lista de productos
│   │   ├── nuevo/page.tsx        #       Formulario de crear producto
│   │   └── [id]/page.tsx         #       Editar producto por ID
│   └── pedidos/                  #    Módulo de Pedidos
│       ├── page.tsx              #       Lista de pedidos
│       ├── nuevo/page.tsx        #       Formulario de crear pedido
│       └── [id]/page.tsx         #       Detalle / cambiar estado de pedido
│
├── components/                   # 🧩 COMPONENTES REUTILIZABLES
│   ├── Sidebar.tsx               #    Barra lateral de navegación (desktop + mobile)
│   ├── DataTable.tsx             #    Tabla de datos genérica con búsqueda
│   ├── Modal.tsx                 #    Ventana modal reutilizable
│   ├── StatusBadge.tsx           #    Indicador visual de estado de pedido
│   └── StockIndicator.tsx        #    Indicador visual de nivel de stock
│
├── lib/                          # 📚 LÓGICA DE NEGOCIO
│   ├── types.ts                  #    Interfaces TypeScript (Customer, Product, Order)
│   ├── api.ts                    #    Funciones para llamar a la API del backend
│   └── store.ts                  #    Datos locales de demostración + CRUD en memoria
│
├── k8s/                          # ☸️ MANIFIESTOS DE KUBERNETES (lo que despliega en la nube)
│   ├── namespace.yaml            #    Crea el espacio de trabajo "dimo3"
│   ├── configmap.yaml            #    Variables de entorno (BACKEND_URL)
│   ├── deployment.yaml           #    ⭐ CREA EL POD (el contenedor corriendo)
│   ├── service.yaml              #    Servicio ClusterIP (red interna)
│   ├── service-nodeport.yaml     #    Servicio NodePort (puerto 30001 en el nodo)
│   ├── service-canary.yaml       #    Servicio Canary (A/B testing)
│   ├── service-headless.yaml     #    Servicio Headless (monitoreo/métricas)
│   ├── ingress.yaml              #    Puerta a Internet (AWS ALB)
│   ├── hpa.yaml                  #    Autoescalado (1 a 5 pods)
│   ├── pdb.yaml                  #    Alta disponibilidad (nunca 0 pods)
│   └── README.md                 #    Guía de despliegue en Kubernetes
│
├── scripts/                      # 🔧 SCRIPTS AUXILIARES
│   └── build_and_push.sh         #    Script para construir y subir imagen Docker manualmente
│
├── docs/                         # 📄 DOCUMENTACIÓN
│   ├── auditoria_imagenes_docker_frontend.md  # Auditoría de seguridad Docker
│   └── documentacion_completa_frontend.md     # ⭐ ESTE ARCHIVO
│
├── Dockerfile                    # 🐳 Instrucciones para crear la imagen Docker
├── Dockerfile.unoptimized        # 🐳 Versión sin optimizar (para comparativa de auditoría)
├── .dockerignore                 # 🐳 Archivos excluidos de Docker (secretos, .git, etc.)
├── azure-pipelines.yml           # 🔄 Pipeline CI/CD (CodeScan → Build → ImageScan)
├── next.config.ts                # ⚙️ Configuración de Next.js (proxy API + standalone)
├── package.json                  # 📦 Dependencias y scripts npm
├── tsconfig.json                 # 📦 Configuración de TypeScript
├── eslint.config.mjs             # 📦 Configuración de ESLint
├── postcss.config.mjs            # 📦 Configuración de PostCSS (TailwindCSS)
├── .gitignore                    # Archivos ignorados por Git
├── .gitleaksignore               # Excepciones para escaneo de secretos
├── .trivyignore                  # CVEs ignoradas en escaneo de imagen
└── README.md                     # Documentación principal del proyecto
```

---

## 3. ¿Qué hace el código?

### 3.1 `app/layout.tsx` — El esqueleto de la aplicación
Es el archivo que envuelve TODA la aplicación. Carga las fuentes de Google (Space Grotesk, IBM Plex Sans, JetBrains Mono), los estilos CSS globales y renderiza el `<Sidebar />` de navegación junto con el contenido de cada página.

### 3.2 `app/page.tsx` — Dashboard / Página de inicio
Muestra un panel de control con 3 tarjetas que resumen los datos:
- **Clientes**: Total y activos.
- **Productos**: Total y activos.
- **Pedidos**: Total y pendientes.

Al cargar, hace 3 llamadas simultáneas a la API (`fetchCustomers`, `fetchProducts`, `fetchOrders`) y calcula los contadores.

### 3.3 `lib/types.ts` — Modelos de datos
Define las interfaces TypeScript que representan los objetos del negocio:

| Interfaz | Campos principales |
|---|---|
| `Customer` | `id`, `fullName`, `email`, `phone`, `isActive`, `createdAt` |
| `Product` | `id`, `name`, `description`, `price`, `stock`, `isActive` |
| `Order` | `id`, `customerId`, `status`, `items[]`, `total` |
| `OrderItem` | `productId`, `productName`, `quantity`, `unitPrice`, `subtotal` |

### 3.4 `lib/api.ts` — Comunicación con el Backend
Contiene las funciones que llaman a la API REST del backend. Traduce los datos del formato `snake_case` del backend al `camelCase` del frontend.

| Función | Método HTTP | Endpoint | Descripción |
|---|---|---|---|
| `fetchCustomers()` | GET | `/api/customers` | Lista todos los clientes |
| `fetchCustomerById(id)` | GET | `/api/customers/:id` | Obtiene un cliente por ID |
| `apiCreateCustomer(data)` | POST | `/api/customers` | Crea un nuevo cliente |
| `apiUpdateCustomer(id, data)` | PATCH | `/api/customers/:id` | Actualiza un cliente |
| `apiDeactivateCustomer(id)` | DELETE | `/api/customers/:id` | Desactiva un cliente |
| `fetchProducts()` | GET | `/api/products` | Lista todos los productos |
| `apiCreateProduct(data)` | POST | `/api/products` | Crea un nuevo producto |
| `apiUpdateProduct(id, data)` | PATCH | `/api/products/:id` | Actualiza precio/stock |
| `fetchOrders()` | GET | `/api/orders` | Lista todos los pedidos |
| `apiCreateOrder(data)` | POST | `/api/orders` | Crea un nuevo pedido |
| `apiUpdateOrderStatus(id, status)` | PATCH | `/api/orders/:id/status` | Cambia estado del pedido |

### 3.5 `next.config.ts` — Proxy y configuración
Configura dos cosas críticas:
1. **`output: "standalone"`**: Empaqueta Next.js como un servidor Node.js independiente (reduce la imagen Docker de 1.25 GB a 148 MB).
2. **`rewrites`**: Actúa como proxy. Cualquier petición a `/api/*` se redirige automáticamente a `BACKEND_URL` (por defecto `http://localhost:5000`). Esto evita problemas de CORS.

### 3.6 `components/Sidebar.tsx` — Navegación
Barra de navegación lateral (en escritorio) o barra inferior (en móvil). Tiene 3 enlaces: Clientes, Productos y Pedidos.

---

## 4. Docker: Del código al contenedor

### ¿Qué es Docker?
Docker empaqueta tu aplicación Next.js junto con todas sus dependencias en una **imagen** (un archivo portable). Esa imagen se puede ejecutar en cualquier servidor como un **contenedor** (una instancia corriendo de la imagen).

### ¿Cómo funciona el `Dockerfile`?
El Dockerfile tiene **3 etapas** (Multi-stage build):

```
┌────────────────────────────────────────────────────────┐
│  ETAPA 1: deps (Dependencias)                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Imagen base: node:22-alpine (liviana)            │  │
│  │ Copia: package.json + package-lock.json          │  │
│  │ Ejecuta: npm ci (instala dependencias)           │  │
│  └──────────────────────────────────────────────────┘  │
│                         │                              │
│                         ▼                              │
│  ETAPA 2: builder (Compilación)                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Copia: node_modules de etapa 1 + todo el código  │  │
│  │ Ejecuta: npm run build (compila Next.js)         │  │
│  │ Genera: carpeta .next/standalone (servidor listo)│  │
│  └──────────────────────────────────────────────────┘  │
│                         │                              │
│                         ▼                              │
│  ETAPA 3: runner (Producción) ← IMAGEN FINAL           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Solo copia los archivos mínimos necesarios       │  │
│  │ Usuario: nextjs (uid 1001, NO root)              │  │
│  │ Puerto: 3001                                     │  │
│  │ HEALTHCHECK: verifica que la app responda        │  │
│  │ Comando: node server.js                          │  │
│  │ PESO FINAL: ~148 MB (vs 1.25 GB sin optimizar)  │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

### Comandos Docker básicos
```bash
# Construir la imagen
docker build -t dimo-frontend --build-arg BACKEND_URL=http://localhost:5000 .

# Ejecutar el contenedor
docker run -d -p 3001:3001 -e BACKEND_URL=http://localhost:5000 dimo-frontend

# Ver contenedores corriendo
docker ps
```

---

## 5. Kubernetes: Conceptos clave explicados

### ¿Qué es Kubernetes (K8s)?
Kubernetes es un **orquestador de contenedores**. Imagina que Docker es como tener UN camión que transporta tu aplicación. Kubernetes es el **sistema de logística completo** que administra una flota de camiones: decide cuántos necesitas, los reemplaza si se averían y reparte la carga entre ellos.

### Los 4 conceptos fundamentales que usas en este proyecto:

#### 🟢 1. Pod (La unidad mínima)
> **Analogía:** Es una **habitación** donde vive tu aplicación.

Un Pod es uno o más contenedores Docker corriendo juntos. En tu caso, cada Pod tiene UN contenedor con tu aplicación Next.js.

**¿Dónde se define?** → En `k8s/deployment.yaml` (el Deployment crea los Pods automáticamente).

#### 🔵 2. Deployment (El administrador de Pods)
> **Analogía:** Es el **gerente del hotel** que se asegura de que siempre haya habitaciones disponibles.

El Deployment le dice a Kubernetes: *"Quiero 1 réplica de mi frontend corriendo. Si se cae, levanta otra."*

**¿Dónde se define?** → `k8s/deployment.yaml`

#### 🟡 3. Service (La red / el enchufe)
> **Analogía:** Es la **recepción del hotel** que le da a cada huésped una dirección fija para encontrar su habitación.

Un Service le asigna un nombre DNS estable (`frontend`) y un puerto fijo (`3001`) a tus Pods, aunque estos se recreen con IPs nuevas.

**¿Dónde se define?** → `k8s/service.yaml`, `k8s/service-nodeport.yaml`, `k8s/service-canary.yaml`, `k8s/service-headless.yaml`

#### 🟣 4. Ingress (La puerta a Internet)
> **Analogía:** Es la **puerta principal del hotel** con un letrero que dice "Bienvenidos".

El Ingress crea un balanceador de carga público en AWS (ALB) que recibe el tráfico de los usuarios desde Internet y lo envía al Service interno.

**¿Dónde se define?** → `k8s/ingress.yaml`

---

## 6. ¿Dónde está el Pod?

```
Archivo: k8s/deployment.yaml
    │
    │  kubectl apply -f k8s/deployment.yaml
    │
    ▼
Kubernetes lee la instrucción y CREA el Pod:

┌─────────────────────────────────────────────────────┐
│  Pod: frontend-7b8d9f6c4a-x2k9m                    │
│  ┌───────────────────────────────────────────────┐  │
│  │  Contenedor: frontend                         │  │
│  │  Imagen: dimo-frontend:latest (desde AWS ECR) │  │
│  │  Puerto: 3001                                 │  │
│  │  Usuario: nextjs (uid 1001, NO root)          │  │
│  │  CPU: 100m-500m | RAM: 128Mi-256Mi            │  │
│  │  Variables: BACKEND_URL=http://backend:3000   │  │
│  │                                               │  │
│  │  Chequeos de salud:                           │  │
│  │  • livenessProbe: GET / cada 30s              │  │
│  │  • readinessProbe: GET / cada 10s             │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

El Pod **NO se crea manualmente**. El `Deployment` lo crea y lo supervisa. Si el Pod se cae, el Deployment crea uno nuevo automáticamente.

---

## 7. ¿Dónde están los Servicios?

Hay **4 Servicios** (`kind: Service`) definidos para el frontend, cada uno con un propósito diferente:

### 7.1 `service.yaml` — ClusterIP (Interno)
```
Tipo: ClusterIP (por defecto)
Nombre DNS: frontend.dimo3.svc.cluster.local
Puerto: 3001
Accesible desde: SOLO dentro del clúster
```
Es el servicio principal. El Ingress y otros pods del clúster se conectan al frontend a través de este servicio.

### 7.2 `service-nodeport.yaml` — NodePort (Puerto directo)
```
Tipo: NodePort
Puerto del nodo: 30001
Accesible desde: http://<IP-del-nodo-EC2>:30001
```
Abre un puerto fijo (30001) directamente en cada servidor/nodo del clúster. Útil para pruebas rápidas sin necesitar un balanceador de carga.

### 7.3 `service-canary.yaml` — Canary (A/B Testing)
```
Tipo: ClusterIP
Selector: app.kubernetes.io/name=frontend + version=canary
```
Filtra tráfico exclusivamente a los Pods que tengan la etiqueta `version: canary`. Permite probar una versión nueva del frontend en paralelo con la versión estable sin afectar a todos los usuarios.

### 7.4 `service-headless.yaml` — Headless (Monitoreo)
```
Tipo: Headless (clusterIP: None)
DNS: retorna las IPs de CADA pod individualmente
```
No asigna una IP única. Cuando Prometheus o Grafana consultan este servicio, obtienen la lista completa de IPs de todos los pods. Permite hacer scraping de métricas pod por pod.

---

## 8. Manifiestos K8s: Archivo por archivo

| # | Archivo | `kind:` | ¿Qué crea en el clúster? |
|---|---|---|---|
| 1 | `namespace.yaml` | `Namespace` | El espacio aislado `dimo3` donde viven todos los recursos |
| 2 | `configmap.yaml` | `ConfigMap` | Variable `BACKEND_URL=http://backend:3000` |
| 3 | `deployment.yaml` | `Deployment` | ⭐ Crea y administra el **Pod** del frontend |
| 4 | `service.yaml` | `Service` (ClusterIP) | Red interna para conectarse al Pod (puerto 3001) |
| 5 | `service-nodeport.yaml` | `Service` (NodePort) | Puerto 30001 abierto directamente en los nodos |
| 6 | `service-canary.yaml` | `Service` (Canary) | Red interna para pods de prueba/versión canary |
| 7 | `service-headless.yaml` | `Service` (Headless) | DNS directo a cada pod para monitoreo |
| 8 | `ingress.yaml` | `Ingress` | Puerta a Internet (crea un AWS ALB público en puerto 80) |
| 9 | `hpa.yaml` | `HorizontalPodAutoscaler` | Escala de 1 a 5 pods según CPU (70%) y RAM (80%) |
| 10 | `pdb.yaml` | `PodDisruptionBudget` | Garantiza que siempre haya al menos 1 pod activo |

---

## 9. Flujo completo: Del código al usuario

```
  TU COMPUTADORA                    AZURE DEVOPS                        AWS (Nube)
 ─────────────                    ──────────────                      ────────────
                                                                          
  1. Escribes código       2. git push main         3. Pipeline CI/CD se ejecuta:
     en Next.js ──────────▶  al repositorio  ──────▶   ┌─ CodeScan (ESLint + audit + Gitleaks)
     (app/, components/,                               ├─ BuildPush (docker build → ECR)
      lib/)                                            └─ ImageScan (Trivy CVE scan + SBOM)
                                                                │
                                                                ▼
                                                       4. Imagen Docker guardada
                                                          en AWS ECR (registro privado)
                                                                │
                                                                ▼
                                                       5. kubectl apply -f k8s/
                                                          (despliegue manual o futuro CD)
                                                                │
                                                                ▼
                                                  ┌─────────────────────────────────┐
                                                  │     CLÚSTER KUBERNETES (EKS)    │
                                                  │                                 │
                                                  │  ┌───────────────────────────┐  │
                                                  │  │ Namespace: dimo3          │  │
                                                  │  │                           │  │
                                                  │  │  [ConfigMap]              │  │
                                                  │  │  BACKEND_URL=http://...   │  │
                                                  │  │         │                 │  │
                                                  │  │         ▼                 │  │
                                                  │  │  [Deployment] ──▶ [Pod]   │  │
                                                  │  │   frontend       Next.js  │  │
                                                  │  │         │        :3001    │  │
                                                  │  │         ▼                 │  │
                                                  │  │  [Service ClusterIP]      │  │
                                                  │  │   frontend:3001           │  │
                                                  │  │         │                 │  │
                                                  │  │         ▼                 │  │
                                                  │  │  [Ingress / ALB]          │  │
                                                  │  │   Puerto 80 (Internet)    │  │
                                                  │  │                           │  │
                                                  │  │  [HPA] escala pods        │  │
                                                  │  │  [PDB] protege pods       │  │
                                                  │  └───────────────────────────┘  │
                                                  └─────────────────────────────────┘
                                                                │
                                                                ▼
                                                  6. Usuario accede desde Internet:
                                                     http://k8s-dimo3-frontend-xxxx.elb.amazonaws.com
```

---

## 10. CI/CD Pipeline

El archivo `azure-pipelines.yml` define un pipeline automático con 3 etapas que se ejecutan en cadena cada vez que se hace `git push` a `main`:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  CodeScan    │────▶│  BuildPush   │────▶│  ImageScan   │
│              │     │              │     │              │
│ • ESLint     │     │ • docker     │     │ • Trivy scan │
│ • npm audit  │     │   build      │     │   HIGH/CRIT  │
│ • Gitleaks   │     │ • push a ECR │     │ • SBOM       │
│   (secretos) │     │   (4 tags)   │     │   CycloneDX  │
└──────────────┘     └──────────────┘     └──────────────┘
  Si falla: STOP       Si falla: STOP      Si falla: STOP
```

---

## 11. Comandos útiles

### Desarrollo local
```bash
npm install              # Instalar dependencias
npm run dev              # Servidor de desarrollo en http://localhost:3001
npm run build            # Compilar para producción
npm run lint             # Ejecutar ESLint
```

### Docker
```bash
docker build -t dimo-frontend --build-arg BACKEND_URL=http://localhost:5000 .
docker run -d -p 3001:3001 dimo-frontend
docker ps                # Ver contenedores corriendo
docker logs <container>  # Ver logs del contenedor
```

### Kubernetes
```bash
# Conectarse al clúster EKS
aws eks update-kubeconfig --name dimo3-eks --region us-east-1

# Desplegar TODO
kubectl apply -f k8s/

# Ver recursos
kubectl get pods -n dimo3                    # Ver Pods
kubectl get svc -n dimo3                     # Ver Servicios
kubectl get ingress -n dimo3                 # Ver Ingress (URL pública)
kubectl get hpa -n dimo3                     # Ver Autoescalado
kubectl get pdb -n dimo3                     # Ver Pod Disruption Budget

# Logs y depuración
kubectl logs -n dimo3 deployment/frontend -f          # Ver logs en tiempo real
kubectl describe pod -n dimo3 <nombre-del-pod>        # Detalles del Pod
kubectl port-forward -n dimo3 svc/frontend 3001:3001  # Acceso local sin ALB

# Operaciones
kubectl rollout restart -n dimo3 deployment/frontend  # Reiniciar pods
kubectl scale -n dimo3 deployment/frontend --replicas=3  # Escalar manual

# Borrar todo
kubectl delete -f k8s/
```

---

## 12. Glosario de términos

| Término | Significado |
|---|---|
| **Pod** | La unidad mínima en Kubernetes. Es donde corre tu contenedor Docker |
| **Deployment** | El administrador que crea, supervisa y recrea Pods automáticamente |
| **Service** | Objeto de red que le da un nombre DNS y puerto estable a los Pods |
| **ClusterIP** | Tipo de Service solo accesible DENTRO del clúster |
| **NodePort** | Tipo de Service que abre un puerto (30000-32767) en los servidores físicos |
| **Headless** | Tipo de Service sin IP virtual; el DNS retorna las IPs de cada Pod |
| **Canary** | Estrategia de despliegue que prueba una versión nueva en paralelo |
| **Ingress** | Puerta de entrada desde Internet. En AWS crea un ALB (balanceador de carga) |
| **HPA** | Horizontal Pod Autoscaler. Escala réplicas automáticamente por CPU/RAM |
| **PDB** | Pod Disruption Budget. Garantiza mínimo de Pods activos en mantenimiento |
| **ConfigMap** | Archivo de configuración (variables de entorno) almacenado en Kubernetes |
| **Namespace** | Espacio aislado dentro del clúster para agrupar recursos de un proyecto |
| **ECR** | Elastic Container Registry. Registro privado de imágenes Docker en AWS |
| **EKS** | Elastic Kubernetes Service. Clúster de Kubernetes administrado por AWS |
| **ALB** | Application Load Balancer. Balanceador de carga de AWS (capa 7/HTTP) |
| **Standalone** | Modo de Next.js que genera un servidor Node.js independiente y liviano |
| **Multi-stage** | Técnica de Dockerfile que usa varias etapas para reducir el tamaño final |
| **Trivy** | Herramienta de escaneo de vulnerabilidades (CVEs) en imágenes Docker |
| **Gitleaks** | Herramienta que detecta secretos filtrados en el historial de Git |
| **SBOM** | Software Bill of Materials. Inventario de todas las dependencias de la imagen |
