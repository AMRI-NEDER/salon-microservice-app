output "resource_group_name" {
  value = module.resource_group.name
}

output "vnet_name" {
  value = module.network.vnet_name
}

output "aks_subnet_id" {
  value = module.network.aks_subnet_id
}

output "appgw_subnet_id" {
  value = module.network.appgw_subnet_id
}

output "acr_name" {
  value = module.acr.name
}

output "acr_login_server" {
  value = module.acr.login_server
}

output "aks_name" {
  value = module.aks.name
}

output "aks_principal_id" {
  value = module.aks.kubelet_identity_object_id
}

output "postgres_server_name" {
  value = module.postgres.server_name
}

output "postgres_fqdn" {
  value = module.postgres.fqdn
}

output "postgres_databases" {
  value = module.postgres.databases
}