variable "project_name" {
  type    = string
  default = "salon"
}

variable "location" {
  type    = string
  default = "francecentral"
}

variable "resource_group_name" {
  type    = string
  default = "salon-rg"
}

variable "vnet_name" {
  type    = string
  default = "salon-vnet"
}

variable "vnet_address_space" {
  type    = list(string)
  default = ["10.0.0.0/16"]
}

variable "aks_subnet_name" {
  type    = string
  default = "subnet-aks"
}

variable "aks_subnet_prefixes" {
  type    = list(string)
  default = ["10.0.1.0/24"]
}

variable "appgw_subnet_name" {
  type    = string
  default = "subnet-appgw"
}

variable "appgw_subnet_prefixes" {
  type    = list(string)
  default = ["10.0.2.0/24"]
}

variable "acr_name" {
  type    = string
  default = "myacr10"
}

variable "aks_name" {
  type    = string
  default = "salon-aks"
}

variable "aks_dns_prefix" {
  type    = string
  default = "salonaks"
}

variable "aks_node_count" {
  type    = number
  default = 1
}

variable "aks_vm_size" {
  type    = string
  default = "Standard_D2as_v5"
}

variable "aks_service_cidr" {
  type    = string
  default = "10.1.0.0/16"
}

variable "aks_dns_service_ip" {
  type    = string
  default = "10.1.0.10"
}

variable "postgres_server_name" {
  type    = string
  default = "salon-pg-server"
}

variable "postgres_admin_username" {
  type    = string
  default = "Nader"
}

variable "postgres_admin_password" {
  type      = string
  sensitive = true
}

variable "postgres_sku_name" {
  type    = string
  default = "B_Standard_B1ms"
}

variable "postgres_storage_mb" {
  type    = number
  default = 32768
}

variable "postgres_version" {
  type    = string
  default = "14"
}

variable "postgres_databases" {
  type = list(string)
  default = [
    "auracut_auth",
    "auracut_user",
    "auracut_booking",
    "auracut_reservations",
    "auracut_promotion",
    "auracut_notification"
  ]
}

variable "tags" {
  type = map(string)
  default = {
    project     = "salon"
    environment = "dev"
    managed_by  = "terraform"
  }
}