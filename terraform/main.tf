################################
# DynamoDB 
################################

resource "aws_dynamodb_table" "main" {
  name = "Todos"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "Id"

  attribute {
    name = "Id"
    type = "S"
  }

  # attribute {
  #   name = "Title"
  #   type = "S"
  # }
  #
  # attribute {
  #   name = "Content"
  #   type = "S"
  # }
  #
  # attribute {
  #   name = "Expiration"
  #   type = "S"
  # }
  #
  # attribute {
  #   name = "Status"
  #   type = "S"
  # }
}
