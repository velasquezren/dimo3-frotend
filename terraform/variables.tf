# =============================================================================
# Variables de Terraform para dimo3-frontend.
# Los defaults estan alineados con los valores del pipeline (azure-pipelines.yml)
# y con aws/task-definition.json. Sobreescribirlos con un terraform.tfvars.
# =============================================================================

variable "aws_region" {
  description = "Region AWS donde se provisiona la infraestructura."
  type        = string
  default     = "us-east-1"
}

variable "aws_account_id" {
  description = "ID de la cuenta AWS (12 digitos). Se usa para armar ARNs y la URI de ECR."
  type        = string
  # Sin default: obliga a definirlo en terraform.tfvars (no hardcodear aca).
}

# --- ECR ---------------------------------------------------------------------

variable "ecr_repository_name" {
  description = "Nombre del repositorio ECR."
  type        = string
  default     = "dimo-frontend"
}

# --- ECS ---------------------------------------------------------------------

variable "ecs_cluster_name" {
  description = "Nombre del cluster ECS."
  type        = string
  default     = "dimo-prod-cluster"
}

variable "ecs_service_name" {
  description = "Nombre del service ECS."
  type        = string
  default     = "dimo-frontend-svc"
}

variable "task_family" {
  description = "Family del task definition de ECS."
  type        = string
  default     = "dimo-frontend-task"
}

variable "container_name" {
  description = "Nombre del contenedor dentro del task definition."
  type        = string
  default     = "dimo-frontend"
}

variable "container_port" {
  description = "Puerto del contenedor (debe coincidir con el Next.js standalone)."
  type        = number
  default     = 3001
}

variable "cpu" {
  description = "CPU (en unidades de 1/1024) para la tarea Fargate."
  type        = number
  default     = 256
}

variable "memory" {
  description = "Memoria (en MB) para la tarea Fargate."
  type        = number
  default     = 512
}

variable "task_desired_count" {
  description = "Numero de tareas (replicas) del service."
  type        = number
  default     = 1
}

# --- Imagen del contenedor ---------------------------------------------------
# La imagen real la determina el pipeline en cada deploy (uri dinamica por build).
# Terraform crea una revision base; el deploy imperativo registra una nueva
# revision con la imagen recien construida. Si se deja vacio, se usa un
# placeholder y la primera revision "util" la crea el pipeline.
variable "image" {
  description = "Imagen del contenedor. Vacio = placeholder (la real la pone el pipeline en deploy)."
  type        = string
  default     = ""
}

# --- CloudWatch Logs ---------------------------------------------------------

variable "log_group_name" {
  description = "Nombre del log group de CloudWatch."
  type        = string
  default     = "/ecs/dimo-frontend"
}

variable "log_retention_in_days" {
  description = "Retencion (dias) de los logs en CloudWatch."
  type        = number
  default     = 30
}

# --- Red (VPC por defecto, NO se gestiona) -----------------------------------
# El service ECS necesita subnets + security group. Se asume la VPC por defecto
# de la cuenta. Si la cuenta no tiene default VPC, ajustar estos data sources
# o parametrizar IDs explicitos.
variable "vpc_id" {
  description = "ID de la VPC donde corre el service. Vacio = usar la default VPC."
  type        = string
  default     = ""
}
