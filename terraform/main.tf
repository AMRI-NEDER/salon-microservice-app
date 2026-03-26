module "resource_group" {
  source = "./modules/resource_group"

  name     = var.resource_group_name
  location = var.location
  tags     = local.common_tags
}

module "network" {
  source = "./modules/network"

  resource_group_name   = module.resource_group.name
  location              = module.resource_group.location
  vnet_name             = var.vnet_name
  vnet_address_space    = var.vnet_address_space
  aks_subnet_name       = var.aks_subnet_name
  aks_subnet_prefixes   = var.aks_subnet_prefixes
  appgw_subnet_name     = var.appgw_subnet_name
  appgw_subnet_prefixes = var.appgw_subnet_prefixes
  tags                  = local.common_tags
}

module "acr" {
  source = "./modules/acr"

  resource_group_name = module.resource_group.name
  location            = module.resource_group.location
  acr_name            = var.acr_name
  tags                = local.common_tags
}

module "aks" {
  source = "./modules/aks"

  resource_group_name = module.resource_group.name
  location            = module.resource_group.location

  aks_name       = var.aks_name
  dns_prefix     = var.aks_dns_prefix
  node_count     = var.aks_node_count
  vm_size        = var.aks_vm_size
  subnet_id      = module.network.aks_subnet_id
  acr_id         = module.acr.id
  service_cidr   = var.aks_service_cidr
  dns_service_ip = var.aks_dns_service_ip
  tags           = local.common_tags
}

module "postgres" {
  source = "./modules/postgres"

  resource_group_name    = module.resource_group.name
  location               = module.resource_group.location
  server_name            = var.postgres_server_name
  administrator_login    = var.postgres_admin_username
  administrator_password = var.postgres_admin_password
  sku_name               = var.postgres_sku_name
  storage_mb             = var.postgres_storage_mb
  postgres_version       = var.postgres_version
  databases              = var.postgres_databases
  tags                   = local.common_tags
}