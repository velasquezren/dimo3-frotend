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

El repositorio incluye `azure-pipelines.yml`, un pipeline que se dispara con cada push a `main` y ejecuta cinco stages en cadena:

1. **CodeScan** — ESLint (errores), `npm audit` (CRITICAL) y Gitleaks (secretos). Puerta pre-build.
2. **BuildPush** — Construye la imagen Docker (con `BACKEND_URL` como build-arg) y la sube a **AWS ECR** con 4 tags: `<version>-<BuildId>`, `<version>`, `<sha-corto>` y `latest`.
3. **ImageScan** — Escaneo con **Trivy** (HIGH/CRITICAL bloquean) + generación de **SBOM CycloneDX**. Puerta pre-deploy.
4. **Terraform** — Provisiona/actualiza la infraestructura AWS (ECR, cluster ECS, roles IAM, log group, task definition, service). Estado local persistido como artifact entre runs.
5. **Deploy** — Deploy **rolling** a **AWS ECS** (Fargate): toma la task definition gestionada por Terraform, le actualiza la imagen por la recién construida, registra una nueva revisión y actualiza el service.

> **Infra gestionada con Terraform.** El cluster ECS, repo ECR, roles IAM, log group, task definition y service ya **no se crean a mano**: los provisiona el stage `Terraform`. Solo se asume la **VPC por defecto** de la cuenta AWS (no se gestiona la VPC).

### Requisitos previos en Azure DevOps
- Extensión **AWS Toolkit for Azure DevOps** instalada en la organización (provee `AWSShellScript@1`).
- Extensión **Terraform Installer** instalada (provee `TerraformInstaller@0`).
- **Service Connection** AWS configurada (nombre esperado: `aws-conection`).
- Variable group **`Frontend-Secrets`** con la variable `BACKEND_URL` (URL del backend de producción).
- Variable group **`Frontend-Terraform`** con la variable `aws_account_id` (ID de cuenta AWS de 12 dígitos).

### Variables a configurar (Azure Pipelines → Variables)
| Variable | Descripción | ¿Secreto? |
|----------|-------------|-----------|
| `awsConnection` | Nombre de la Service Connection AWS | No (`aws-conection`) |
| `awsRegion` | Región AWS (ej. `us-east-1`) | No |
| `ecrRepository` | Nombre del repo ECR | No |
| `ecsCluster` | Nombre del cluster ECS | No |
| `ecsService` | Nombre del service ECS | No |
| `ecsTaskFamily` | Family del task definition | No |
| `containerName` | Nombre del contenedor (debe coincidir con el del task definition) | No |

> `BACKEND_URL` y `aws_account_id` **no** se listan acá porque viven en **Library** (variable groups), no en las variables del pipeline.

### Requisitos previos en AWS
- **VPC por defecto** disponible en la cuenta (con subnets). Si no existe, ajustar `var.vpc_id` en `terraform/terraform.tfvars`.
- Credenciales con permisos para crear ECR, ECS, IAM y CloudWatch (la service connection `aws-conection`).

El resto (ECR, cluster ECS, service, roles IAM, log group, task definition) lo crea Terraform automáticamente en el primer run del pipeline.

### Ejecución manual
Desde Azure DevOps: **Pipelines → seleccionar el pipeline → Run pipeline → Rama `main`**.

---

## Infraestructura con Terraform

La infraestructura AWS del proyecto vive en `terraform/` y se gestiona con Terraform. El pipeline ejecuta `terraform fmt -check`, `init`, `validate`, `plan` y `apply` en cada run a `main`.

### Recursos gestionados
| Recurso | Tipo Terraform |
|---------|----------------|
| Repositorio ECR (`dimo-frontend`) + lifecycle policy + scan on push | `aws_ecr_repository`, `aws_ecr_lifecycle_policy` |
| Cluster ECS (`dimo-prod-cluster`) con Container Insights | `aws_ecs_cluster` |
| Rol IAM de ejecución (pull ECR + CloudWatch) | `aws_iam_role` + `aws_iam_role_policy_attachment` |
| Rol IAM de tarea (vacío, la app no llama a AWS) | `aws_iam_role` |
| Log group CloudWatch (`/ecs/dimo-frontend`) | `aws_cloudwatch_log_group` |
| Task definition Fargate (puerto 3001, healthCheck wget) | `aws_ecs_task_definition` |
| Service ECS (`dimo-frontend-svc`) + security group | `aws_ecs_service`, `aws_security_group` |

### Cómo correrlo localmente
```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars   # ajustar aws_account_id
terraform init
terraform plan
terraform apply
```

### State: importante
El state es **local** (`terraform/terraform.tfstate`), **sin backend remoto**. En el pipeline, el `.tfstate` se publica como artifact (`terraform-state`) y se descarga al inicio del siguiente run, para mantener continuidad entre builds.

> ⚠️ **Riesgo del state local en CI**: si dos runs se superponen, o si el artifact se pierde, puede haber drift. Para un entorno de producción real, migrar a un **backend remoto** (`s3` + `dynamodb` para locking). Esa migración está fuera del alcance actual.

> El archivo `aws/task-definition.json` queda como referencia histórica; la fuente de verdad del contenedor ahora es `terraform/main.tf`. El deploy del pipeline ya no renderiza ese JSON: toma la revisión activa gestionada por Terraform y solo le cambia la imagen.
