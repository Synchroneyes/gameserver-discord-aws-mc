output "AWS_ACCESS_KEY" {
  value = aws_iam_access_key.bot_access_key.id
}

output "AWS_SECRET_ACCESS_KEY" {
  value = nonsensitive(aws_iam_access_key.bot_access_key.secret)
}