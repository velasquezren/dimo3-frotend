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

El repositorio incluye `azure-pipelines.yml`, un pipeline que se dispara con cada push a `main` y ejecuta:

1. **Build** de la imagen Docker (inyectando `BACKEND_URL` como build-arg).
2. **Push** a **AWS ECR** con 4 tags: `<version>-<BuildId>`, `<version>`, `<sha-corto>` y `latest`.
3. **Deploy** a **AWS ECS** (Fargate) con estrategia **rolling**: registra una nueva revisión del task definition y actualiza el service.

> **Infra mínima en AWS: solo `ECR` + `ECS`.** El cluster, service y repo ECR deben existir previamente; el pipeline los consume por variables. No requiere Secrets Manager, ALB ni VPC dedicada: `BACKEND_URL` vive en Azure Pipelines y se "hornea" en la imagen en build time, y ECS usa la VPC por defecto de la cuenta.

### Requisitos previos en Azure DevOps
- Extensión **AWS Toolkit for Azure DevOps** instalada en la organización.
- **Service Connection** AWS configurada (nombre esperado: `aws-conection`).
- Variable **`BACKEND_URL`** en **Pipelines → Library** con la URL del backend de producción.

### Variables a configurar (Azure Pipelines → Variables)
| Variable | Descripción | ¿Secreto? |
|----------|-------------|-----------|
| `awsConnection` | Nombre de la Service Connection AWS | No (valor por defecto: `aws-conection`) |
| `awsRegion` | Región AWS (ej. `us-east-1`) | No |
| `ecrRepository` | Nombre del repo ECR | No |
| `ecsCluster` | Nombre del cluster ECS | No |
| `ecsService` | Nombre del service ECS | No |
| `ecsTaskFamily` | Family del task definition | No |
| `containerName` | Nombre del contenedor (debe coincidir con `aws/task-definition.json`) | No |

> `BACKEND_URL` **no** se lista acá porque vive en **Library**, no en las variables del pipeline.

### Requisitos previos en AWS (mínimo: ECR + ECS)
Antes de ejecutar el pipeline por primera vez deben existir **solo**:
- **ECR**: repositorio con el nombre de `ecrRepository`.
- **ECS**: cluster (`ecsCluster`) y service (`ecsService`) con su respectivo task definition family (`ecsTaskFamily`).
- **Rol de ejecución IAM** (`executionRoleArn`): obligatorio para que ECS pueda descargar la imagen de ECR y emitir logs a CloudWatch — se crea una sola vez y se reutiliza. No es un servicio aparte.

Ajustes accesorios (no son servicios que provisiones aparte):
- **VPC/subnets**: se usa la VPC por defecto de la cuenta.
- **CloudWatch Logs**: el log groupreferenciado en el task definition (se nombra, no se "crea" como servicio aparte).

### Plantilla del task definition
`aws/task-definition.json` es la plantilla base (Fargate, puerto 3001). La imagen del contenedor la reemplaza automáticamente el paso `AmazonECSRenderTaskDefinition`. Los únicos campos marcados con `<<AJUSTAR>>` son los **ARN de roles IAM** y el **nombre del log group**.

### Ejecución manual
Desde Azure DevOps: **Pipelines → seleccionar el pipeline → Run pipeline → Rama `main`**.
