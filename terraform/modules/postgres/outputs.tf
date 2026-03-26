output "server_name" {
  value = azurerm_postgresql_flexible_server.this.name
}

output "fqdn" {
  value = azurerm_postgresql_flexible_server.this.fqdn
}

output "databases" {
  value = [for db in azurerm_postgresql_flexible_server_database.dbs : db.name]
}