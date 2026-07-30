# =============================================================================
# Recursos de infraestructura para dimo3-frontend.
# Replica fielmente lo que el pipeline CI/CD consumia como "pre-existente":
# ECR, cluster ECS, roles IAM, log group, task definition y service.
#
# El task definition mantiene la misma forma que aws/task-definition.json
# (Fargate, awsvpc, puerto 3001, healthCheck wget, logs awslogs).
# La imagen del contenedor la actualiza el pipeline en cada deploy (uri dinamica);
# Terraform deja una revision base con imagen "latest" o placeholder.
# =============================================================================

# ---------------------------------------------------------------------------
# Data sources: VPC y subnets por defecto (NO se gestionan).
# El service ECS necesita subnets + security group. Si la cuenta no tiene
# default VPC, definir var.vpc_id y/o proveer subnet ids explicitos.
# ---------------------------------------------------------------------------
data "aws_vpc" "selected" {
  count   = var.vpc_id == "" ? 1 : 0
  default = true
}

locals {
  vpc_id = var.vpc_id != "" ? var.vpc_id : try(data.aws_vpc.selected[0].id, null)
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [local.vpc_id]
  }
}

# Security group del service: permite trafico HTTP entrante en el puerto del contenedor.
resource "aws_security_group" "ecs_service" {
  name        = "${var.ecs_service_name}-sg"
  description = "Acceso HTTP al contenedor ${var.container_name}"
  vpc_id      = local.vpc_id

  ingress {
    description = "HTTP al contenedor"
    from_port   = var.container_port
    to_port     = var.container_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "Salida libre (pull ECR, salida a internet, etc.)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name       = "${var.ecs_service_name}-sg"
    Proyecto   = "dimo3"
    Componente = "frontend"
  }
}

# ---------------------------------------------------------------------------
# ECR: repositorio donde el pipeline pushea la imagen Docker.
# ---------------------------------------------------------------------------
resource "aws_ecr_repository" "frontend" {
  name                 = var.ecr_repository_name
  image_tag_mutability = "MUTABLE" # el pipeline reescribe :latest
  force_delete         = true      # permite borrar el repo incluso con imagenes (dev)

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name       = var.ecr_repository_name
    Proyecto   = "dimo3"
    Componente = "frontend"
  }
}

# Politica de ciclo de vida: mantener las ultimas N imagenes + latest.
resource "aws_ecr_lifecycle_policy" "frontend" {
  repository = aws_ecr_repository.frontend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Mantener las ultimas 10 imagenes etiquetadas"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["v", "latest"]
          countType     = "imageCountMoreThan"
          countNumber   = 10
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Expirar sin etiqueta despues de 7 dias"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 7
        }
        action = { type = "expire" }
      }
    ]
  })
}

# ---------------------------------------------------------------------------
# Cluster ECS.
# ---------------------------------------------------------------------------
resource "aws_ecs_cluster" "main" {
  name = var.ecs_cluster_name

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name       = var.ecs_cluster_name
    Proyecto   = "dimo3"
    Componente = "frontend"
  }
}

# ---------------------------------------------------------------------------
# CloudWatch Logs: log group del contenedor.
# ---------------------------------------------------------------------------
resource "aws_cloudwatch_log_group" "frontend" {
  name              = var.log_group_name
  retention_in_days = var.log_retention_in_days

  tags = {
    Name       = var.log_group_name
    Proyecto   = "dimo3"
    Componente = "frontend"
  }
}

# ---------------------------------------------------------------------------
# IAM: rol de ejecucion de la tarea.
# Necesita: pull de ECR + escribir logs a CloudWatch.
# ---------------------------------------------------------------------------
data "aws_iam_policy_document" "ecs_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "task_execution" {
  name               = "${var.task_family}-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json

  tags = {
    Name       = "${var.task_family}-execution"
    Proyecto   = "dimo3"
    Componente = "frontend"
  }
}

# Politicas administradas de AWS que cubren el caso de uso estandar:
#  - AmazonECSTaskExecutionRolePolicy : pull ECR + CloudWatch Logs
resource "aws_iam_role_policy_attachment" "task_execution" {
  role       = aws_iam_role.task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Rol de tarea: permisos que tiene la app DENTRO del contenedor.
# El frontend no llama a servicios AWS directamente, asi que se crea vacio
# (assume role only). Agregar policies aca si la app lo necesita.
resource "aws_iam_role" "task" {
  name               = "${var.task_family}-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume_role.json

  tags = {
    Name       = "${var.task_family}-task"
    Proyecto   = "dimo3"
    Componente = "frontend"
  }
}

# ---------------------------------------------------------------------------
# Task definition (Fargate). Misma forma que aws/task-definition.json.
# ---------------------------------------------------------------------------
locals {
  # Imagen por defecto si no se pasa ninguna: tag "latest" del repo propio.
  container_image = var.image != "" ? var.image : "${aws_ecr_repository.frontend.repository_url}:latest"

  container_definitions = jsonencode([
    {
      name      = var.container_name
      image     = local.container_image
      essential = true

      portMappings = [
        {
          name          = "http"
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
          appProtocol   = "http"
        }
      ]

      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = tostring(var.container_port) },
        { name = "HOSTNAME", value = "0.0.0.0" },
        { name = "NEXT_TELEMETRY_DISABLED", value = "1" }
      ]

      healthCheck = {
        command = [
          "CMD-SHELL",
          "wget --quiet --tries=1 --spider http://127.0.0.1:${var.container_port}/ || exit 1"
        ]
        interval    = 30
        timeout     = 10
        retries     = 3
        startPeriod = 20
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = var.task_family
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = tostring(var.cpu)
  memory                   = tostring(var.memory)

  execution_role_arn = aws_iam_role.task_execution.arn
  task_role_arn      = aws_iam_role.task.arn

  container_definitions = local.container_definitions

  tags = {
    Name       = var.task_family
    Proyecto   = "dimo3"
    Componente = "frontend"
  }
}

# ---------------------------------------------------------------------------
# Service ECS (Fargate, redeploy controlado por el pipeline via update-service).
# ---------------------------------------------------------------------------
resource "aws_ecs_service" "frontend" {
  name                               = var.ecs_service_name
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.frontend.arn
  desired_count                      = var.task_desired_count
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  launch_type                        = "FARGATE"
  scheduling_strategy                = "REPLICA"

  network_configuration {
    subnets          = data.aws_subnets.default.ids
    security_groups  = [aws_security_group.ecs_service.id]
    assign_public_ip = true # VPC por defecto + sin NAT: tareas con IP publica para salir
  }

  # Evitar que Terraform sobreescriba el deploy que hace el pipeline (que
  # registra nuevas revisiones con la imagen recien construida). Ignoramos los
  # cambios en task_definition para que convivan sin pelearse.
  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  tags = {
    Name       = var.ecs_service_name
    Proyecto   = "dimo3"
    Componente = "frontend"
  }
}
