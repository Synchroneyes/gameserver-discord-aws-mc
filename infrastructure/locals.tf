locals {
  raw_data         = yamldecode(file("${path.module}/config.yaml"))
  region           = local.raw_data["region"]
  ecs_cluster_name = local.raw_data["cluster_name"]
  ecr_repository   = local.raw_data["ecr_repository"]
}
