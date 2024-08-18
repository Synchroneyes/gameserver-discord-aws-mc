resource "aws_ssm_parameter" "securitygroup_id" {
  name  = "/mineralcontest/securitygroup_id"
  value = aws_security_group.mineralcontest.id
  type  = "String"
}

resource "aws_ssm_parameter" "subnet_id" {
  name  = "/mineralcontest/subnet_id"
  value = module.vpc.public_subnets[0]
  type  = "String"
}