resource "aws_iam_instance_profile" "ec2_ssm_instance_profile" {
  name = "EC2-SSM-Instance-Profile"
  role = aws_iam_role.ec2_ssm_instance_role.name
}

resource "aws_iam_role" "ec2_ssm_instance_role" {
  name               = "EC2-SSM-Instance-role"
  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF
}


resource "aws_iam_role" "ecs_task_role" {
  name               = "ECS-Task-role"
  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "ecs-tasks.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF
}

resource "aws_iam_policy_attachment" "ecs_attachment" {
  name       = "ECS-Task-attachment"
  roles      = [aws_iam_role.ecs_task_role.name]
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}


resource "aws_iam_policy" "bot_policy" {
  name        = "bot_policy"
  description = "Policy used by the bot"

  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "ec2:DescribeNetworkInterfaces*",
        ]
        Effect   = "Allow"
        Resource = "*"
      },
      {
        Action = [
          "ecs:StopTask",
          "ecs:DescribeTasks",
          "iam:PassRole",
          "ecs:RunTask",
        ]
        Effect = "Allow"
        Resource = [
          "${aws_ecs_task_definition.mineralcontest_task.arn_without_revision}:*",
          "arn:aws:ecs:*:${data.aws_caller_identity.current.account_id}:task/*/*",
          "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/ECS-Task-role"
        ],

      },
      {
        Action = [
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
        ]
        Effect = "Allow"
        Resource = [
          aws_dynamodb_table.tasks.arn,
        ],

      },
      {
        Action = [
          "ssm:GetParameter"
        ]
        Effect = "Allow"
        Resource = [
          aws_ssm_parameter.securitygroup_id.arn,
          aws_ssm_parameter.subnet_id.arn,
        ],

      }
    ]
  })
}

resource "aws_iam_user" "bot_user" {
  name = "bot_user"
}

resource "aws_iam_user_policy_attachment" "name" {
  user       = aws_iam_user.bot_user.name
  policy_arn = aws_iam_policy.bot_policy.arn
}

resource "aws_iam_access_key" "bot_access_key" {
  user = aws_iam_user.bot_user.name
}
