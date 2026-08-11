# Dimo Frontend - Panel de Control

Este es el frontend del sistema de gestión **Dimo**, desarrollado con **Next.js** (App Router) y **TypeScript**. Se conecta a un backend Express para gestionar clientes, productos y pedidos.

## Características
- **Clientes**: Registro, edición y desactivación de clientes.
- **Productos**: Gestión de inventario de productos.
- **Pedidos**: Creación y control de estados de pedidos (PENDING, CONFIRMED, DELIVERED, CANCELLED).
- **Integración con Backend**: Proxificación de APIs mediante `rewrites` en Next.js para evitar problemas de CORS.

---

## Configuración y Desarrollo Local

### Requisitos previos
- Node.js v20 o superior
- Tener el backend de Dimo corriendo (por defecto en `http://localhost:5000`)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar servidor de desarrollo
El frontend está configurado para correr en el puerto **3001** (para evitar conflictos de puertos con el backend):
```bash
npm run dev
```
Abre [http://localhost:3001](http://localhost:3001) en tu navegador para ver la aplicación.

---

## Integración con la API (Next.js Rewrites)
En lugar de apuntar directamente al backend en el código del navegador, Next.js actúa como proxy. Cualquier petición dirigida a `/api/*` es capturada por Next.js y redirigida a la dirección configurada en la variable `BACKEND_URL` (por defecto `http://localhost:5000`).

Para cambiar la dirección del backend en desarrollo sin modificar el código, puedes pasar la variable de entorno:
```bash
BACKEND_URL=http://tu-servidor-backend:5000 npm run dev
```

---

## Docker y Despliegue en Producción

El proyecto incluye un `Dockerfile` optimizado en múltiples etapas (Multi-stage build) que aprovecha la salida `standalone` de Next.js, reduciendo drásticamente el tamaño de la imagen final.

### Construir la imagen de Docker
Durante la construcción (build time) puedes pasar la URL del backend por defecto:
```bash
docker build -t dimo-frontend --build-arg BACKEND_URL=http://localhost:5000 .
```

### Ejecutar el contenedor
El contenedor expone la aplicación en el puerto **3001**:
```bash
docker run -d -p 3001:3001 -e BACKEND_URL=http://localhost:5000 dimo-frontend
```
En producción, puedes definir la variable `BACKEND_URL` para apuntar a tu contenedor de backend en la red privada de Docker (ej. `http://dimo-backend:5000`).

---

## CI/CD (Azure Pipelines + AWS)

El repositorio incluye `azure-pipelines.yml`, un pipeline que se dispara con cada push a `main` y ejecuta tres stages en cadena:

1. **CodeScan** — ESLint (errores), `npm audit` (CRITICAL) y Gitleaks (secretos). Puerta pre-build.
2. **BuildPush** — Construye la imagen Docker (con `BACKEND_URL` como build-arg) y la sube a **AWS ECR** (`dimo-frontend`) con 4 tags: `<version>-<BuildId>`, `<version>`, `<sha-corto>` y `latest`.
3. **ImageScan** — Escaneo con **Trivy** (HIGH/CRITICAL bloquean) + generación de **SBOM CycloneDX**.

> **El pipeline SOLO construye y publica la imagen Docker.** No provisiona infraestructura ni despliega a ningún orquestador.
>
> - **Infraestructura AWS** (VPC, EKS, ECR, IAM): se gestiona en el repo **`dimo3-infra`** con Terraform (ver [`dimo3-infra/README.md`](../dimo3-infra/README.md)).
> - **Despliegue a Kubernetes (EKS)**: se hará aparte con `kubectl apply` cuando se agreguen los manifiestos en `k8s/` (futuro).

### Requisitos previos en Azure DevOps
- Extensión **AWS Toolkit for Azure DevOps** instalada en la organización (provee `AWSShellScript@1`).
- **Service Connection** AWS configurada (nombre esperado: `aws-conection`).
- Variable group **`Frontend-Terraform`** con la variable `BACKEND_URL_PRODUCTION` (URL del backend de producción, se inyecta como build-arg).

### Variables a configurar (Azure Pipelines → Variables)
| Variable | Descripción | ¿Secreto? |
|----------|-------------|-----------|
| `awsConnection` | Nombre de la Service Connection AWS | No (`aws-conection`) |
| `awsRegion` | Región AWS (ej. `us-east-1`) | No |
| `ecrRepository` | Nombre del repo ECR (`dimo-frontend`, gestionado por `dimo3-infra`) | No |

> `BACKEND_URL_PRODUCTION` **no** se lista acá porque vive en **Library** (variable group `Frontend-Terraform`).

### Requisitos previos en AWS
- Repositorio **ECR `dimo-frontend`** existente en la cuenta AWS (lo crea el Terraform de `dimo3-infra`).
- Credenciales con permisos para hacer push a ECR (la service connection `aws-conection`).

### Ejecución manual
Desde Azure DevOps: **Pipelines → seleccionar el pipeline → Run pipeline → Rama `main`**.

---

## Infraestructura y despliegue

- **Infraestructura AWS** (cluster EKS, VPC, ECR, IAM, KMS, CloudWatch): gestionada con Terraform en el repo [`dimo3-infra`](../dimo3-infra/). No se incluye en este repo.
- **Despliegue a Kubernetes**: pendiente. Cuando se implemente, los manifiestos K8s (Deployment, Service, ConfigMap) vivirán en `k8s/` en este repo y se aplicarán con `kubectl` sobre el cluster `dimo3-eks` que provisiona `dimo3-infra`. Ver [`dimo3-infra/docs/K8S-DEPLOYMENT.md`](../dimo3-infra/docs/K8S-DEPLOYMENT.md) para la guía general.
