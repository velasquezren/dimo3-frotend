# =============================================================================
# Provider y configuracion base de Terraform para dimo3-frontend.
#
# Provisiona la infraestructura AWS que el pipeline CI/CD consume:
#   - Repositorio ECR
#   - Cluster ECS + service + task definition (Fargate)
#   - Roles IAM de ejecucion y tarea
#   - Log group de CloudWatch
#
# State: LOCAL (sin backend remoto). En el pipeline de Azure DevOps el
# terraform.tfstate se persiste como artifact entre runs para no perderlo.
# Para produccion real conviene migrar a un backend S3 + DynamoDB (locking).
# =============================================================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}
