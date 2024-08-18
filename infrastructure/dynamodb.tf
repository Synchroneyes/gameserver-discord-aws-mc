resource "aws_dynamodb_table" "tasks" {
  name         = "mineralcontest_tasks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "taskId"
  attribute {
    name = "taskId"
    type = "S"
  }
}