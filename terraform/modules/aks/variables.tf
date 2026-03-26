variable "resource_group_name" {
  type = string
}

variable "location" {
  type = string
}

variable "aks_name" {
  type = string
}

variable "dns_prefix" {
  type = string
}

variable "node_count" {
  type = number
}

variable "vm_size" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "acr_id" {
  type = string
}

variable "service_cidr" {
  type = string
}

variable "dns_service_ip" {
  type = string
}

variable "tags" {
  type = map(string)
}