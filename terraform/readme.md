# Terraform - Aura Cut Infra

This Terraform project provisions:
- Resource Group
- VNet
- AKS subnet
- AGC subnet
- ACR
- AKS
- PostgreSQL Flexible Server
- PostgreSQL databases

## Commands

terraform init
terraform fmt -recursive
terraform validate
terraform plan -out tfplan
terraform apply tfplan