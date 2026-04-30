variable "location" {
  type = string
}

variable "resource_group_name" {
  type = string
}

variable "vnet_name" {
  type = string
}

variable "vnet_address_space" {
  type = list(string)
}

variable "aks_subnet_name" {
  type = string
}

variable "aks_subnet_prefixes" {
  type = list(string)
}

variable "appgw_subnet_name" {
  type = string
}

variable "appgw_subnet_prefixes" {
  type = list(string)
}

variable "acr_name" {
  type = string
}

variable "aks_name" {
  type = string
}

variable "aks_dns_prefix" {
  type = string
}

variable "aks_node_count" {
  type = number
}

variable "aks_vm_size" {
  type = string
}

variable "aks_service_cidr" {
  type = string
}

variable "aks_dns_service_ip" {
  type = string
}

variable "postgres_server_name" {
  type = string
}

variable "postgres_admin_username" {
  type = string
}

variable "postgres_admin_password" {
  type      = string
  sensitive = true
}

variable "postgres_sku_name" {
  type = string
}

variable "postgres_storage_mb" {
  type = number
}

variable "postgres_version" {
  type = string
}

variable "postgres_databases" {
  type = list(string)
}

variable "tags" {
  type = map(string)
}