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
