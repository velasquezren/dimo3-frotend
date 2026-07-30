# =============================================================================
# Outputs utiles para el pipeline y para operar la infra manualmente.
# =============================================================================

output "ecr_repository_uri" {
  description = "URI completa del repositorio ECR (host/repo)."
  value       = aws_ecr_repository.frontend.repository_url
}

output "ecr_repository_arn" {
  description = "ARN del repositorio ECR."
  value       = aws_ecr_repository.frontend.arn
}

output "ecs_cluster_name" {
  description = "Nombre del cluster ECS."
  value       = aws_ecs_cluster.main.name
}

output "ecs_cluster_arn" {
  description = "ARN del cluster ECS."
  value       = aws_ecs_cluster.main.arn
}

output "ecs_service_name" {
  description = "Nombre del service ECS."
  value       = aws_ecs_service.frontend.name
}

output "task_definition_arn" {
  description = "ARN de la revision base del task definition (gestionada por Terraform)."
  value       = aws_ecs_task_definition.frontend.arn
}

output "task_family" {
  description = "Family del task definition."
  value       = aws_ecs_task_definition.frontend.family
}

output "execution_role_arn" {
  description = "ARN del rol IAM de ejecucion."
  value       = aws_iam_role.task_execution.arn
}

output "task_role_arn" {
  description = "ARN del rol IAM de tarea."
  value       = aws_iam_role.task.arn
}

output "log_group_name" {
  description = "Nombre del log group de CloudWatch (gestionado fuera de Terraform)."
  value       = var.log_group_name
}
