module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = "mineralcontest-vpc"
  cidr = "10.0.0.0/16"

  azs            = ["${local.region}a"]
  public_subnets = ["10.0.1.0/24"]

}