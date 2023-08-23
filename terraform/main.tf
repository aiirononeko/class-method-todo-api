################################
# IAM Role For Lambda
################################

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "lambda_dynamodb" {
  statement {
    effect = "Allow"

    actions = ["dynamodb:Scan", "dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"]

    resources = ["*"]
  }
}

resource "aws_iam_role" "iam_for_lambda" {
  name               = "iam_for_lambda"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
  inline_policy {
    name   = "policy-8675309"
    policy = data.aws_iam_policy_document.lambda_dynamodb.json
  }
}

################################
# IAM Role For API Gateway
################################

resource "aws_iam_role" "api_gateway_role" {
  name               = "apigateway-role"
  assume_role_policy = data.aws_iam_policy_document.api_gateway_assume_role.json
}

resource "aws_iam_role_policy_attachment" "api_gateway_policy_logs" {
  role       = aws_iam_role.api_gateway_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs"
}

resource "aws_iam_role_policy_attachment" "api_gateway_policy_lambda" {
  role       = aws_iam_role.api_gateway_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaRole"
}

data "aws_iam_policy_document" "api_gateway_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    effect  = "Allow"
    principals {
      type        = "Service"
      identifiers = ["apigateway.amazonaws.com"]
    }
  }
}

################################
# Lambda - Retrieve List of TODO
################################

data "archive_file" "retrieve_todo_lambda_zip" {
  type        = "zip"
  source_dir  = "../dist/retrieve"
  output_path = "dist/retrieve/build.zip"
}

resource "aws_lambda_function" "retrieve-todo" {
  depends_on       = [aws_iam_role.iam_for_lambda]
  filename         = data.archive_file.retrieve_todo_lambda_zip.output_path
  function_name    = "retrieve-todo"
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.retrieve_todo_lambda_zip.output_base64sha256
}

################################
# Lambda - Create TODO
################################

data "archive_file" "create_todo_lambda_zip" {
  type        = "zip"
  source_dir  = "../dist/create"
  output_path = "dist/create/build.zip"
}

resource "aws_lambda_function" "create-todo" {
  depends_on       = [aws_iam_role.iam_for_lambda]
  filename         = data.archive_file.create_todo_lambda_zip.output_path
  function_name    = "create-todo"
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.create_todo_lambda_zip.output_base64sha256
}

################################
# Lambda - Update TODO
################################

data "archive_file" "update_todo_lambda_zip" {
  type        = "zip"
  source_dir  = "../dist/update"
  output_path = "dist/update/build.zip"
}

resource "aws_lambda_function" "update-todo" {
  depends_on       = [aws_iam_role.iam_for_lambda]
  filename         = data.archive_file.update_todo_lambda_zip.output_path
  function_name    = "update-todo"
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.update_todo_lambda_zip.output_base64sha256
}

################################
# Lambda - Delete TODO
################################

data "archive_file" "delete_todo_lambda_zip" {
  type        = "zip"
  source_dir  = "../dist/delete"
  output_path = "dist/delete/build.zip"
}

resource "aws_lambda_function" "delete-todo" {
  depends_on       = [aws_iam_role.iam_for_lambda]
  filename         = data.archive_file.delete_todo_lambda_zip.output_path
  function_name    = "delete-todo"
  role             = aws_iam_role.iam_for_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  source_code_hash = data.archive_file.delete_todo_lambda_zip.output_base64sha256
}

################################
# API Gateway
################################

resource "aws_api_gateway_api_key" "main" {
  name = "apiKey"
}

resource "aws_api_gateway_usage_plan" "main" {
  name       = "usage_plan"
  depends_on = [aws_api_gateway_deployment.deployment]

  api_stages {
    api_id = aws_api_gateway_rest_api.todo-api.id
    stage  = aws_api_gateway_deployment.deployment.stage_name
  }
}

resource "aws_api_gateway_usage_plan_key" "main" {
  key_id        = aws_api_gateway_api_key.main.id
  key_type      = "API_KEY"
  usage_plan_id = aws_api_gateway_usage_plan.main.id
}

resource "aws_api_gateway_rest_api" "todo-api" {
  name = "todo-api"

  body = jsonencode({
    openapi = "3.0.1"
    info = {
      title   = "todo-api"
      version = "1.0"
    }
    paths = {
      "/todos" = {
        get = {
          x-amazon-apigateway-integration = {
            httpMethod           = "POST"
            payloadFormatVersion = "1.0"
            type                 = "AWS_PROXY"
            uri                  = aws_lambda_function.retrieve-todo.invoke_arn
            credentials          = aws_iam_role.api_gateway_role.arn
          }
        }
      }
      "/todo" = {
        post = {
          x-amazon-apigateway-integration = {
            httpMethod           = "POST"
            payloadFormatVersion = "1.0"
            type                 = "AWS_PROXY"
            uri                  = aws_lambda_function.create-todo.invoke_arn
            credentials          = aws_iam_role.api_gateway_role.arn
          }
        }
      }
      "/todo/{todoId}" = {
        put = {
          x-amazon-apigateway-integration = {
            httpMethod           = "POST"
            payloadFormatVersion = "1.0"
            type                 = "AWS_PROXY"
            uri                  = aws_lambda_function.update-todo.invoke_arn
            credentials          = aws_iam_role.api_gateway_role.arn
          }
        }
        delete = {
          x-amazon-apigateway-integration = {
            httpMethod           = "POST"
            payloadFormatVersion = "1.0"
            type                 = "AWS_PROXY"
            uri                  = aws_lambda_function.delete-todo.invoke_arn
            credentials          = aws_iam_role.api_gateway_role.arn
          }
        }
      }
    }
  })
}

resource "aws_api_gateway_deployment" "deployment" {
  rest_api_id = aws_api_gateway_rest_api.todo-api.id
  depends_on  = [aws_api_gateway_rest_api.todo-api]
  stage_name  = "prod"
  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.todo-api))
  }
}

data "aws_iam_policy_document" "api_gateway_policy" {
  statement {
    effect = "Allow"
    principals {
      type = "*"
      identifiers = ["*"]
    }
    actions   = ["execute-api:Invoke"]
    resources = ["${aws_api_gateway_rest_api.todo-api.execution_arn}/*"]
  }
}

resource "aws_api_gateway_rest_api_policy" "policy" {
  rest_api_id = aws_api_gateway_rest_api.todo-api.id
  policy = data.aws_iam_policy_document.api_gateway_policy.json
}

################################
# DynamoDB 
################################

resource "aws_dynamodb_table" "main" {
  name = "todos"
  billing_mode   = "PROVISIONED"
  read_capacity  = 20
  write_capacity = 20
  hash_key       = "Id"

  attribute {
    name = "Id"
    type = "S"
  }
}
