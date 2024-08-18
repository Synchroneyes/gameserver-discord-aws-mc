resource "aws_ecs_cluster" "cluster" {
  name = local.ecs_cluster_name
}

resource "aws_ecs_task_definition" "mineralcontest_task" {
  family                   = "mineralcontest"
  task_role_arn            = aws_iam_role.ecs_task_role.arn
  execution_role_arn       = aws_iam_role.ecs_task_role.arn
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "2048"
  memory                   = "4096"
  container_definitions = jsonencode(
    [
      {
        name      = "mineralcontest",
        image     = "${local.ecr_repository}:latest",
        cpu       = 0,
        memory    = 128,
        essential = true,
        portMappings = [
          {
            containerPort = 25565,
            hostPort      = 25565,
          },
        ]
      },
    ]
  )

}

resource "aws_security_group" "mineralcontest" {
  vpc_id = module.vpc.vpc_id
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 25565
    to_port     = 25565
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 25565
    to_port     = 25565
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
