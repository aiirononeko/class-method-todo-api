terraform {
  # backend "s3" {
  #   bucket = "katada-terraform-backend"
  #   key = "backend"
  #   region = "ap-northeast-1"
  # }

  backend "local" {
    path   = "terraform.tfstate"
  }
}
