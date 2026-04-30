location            = "francecentral"
resource_group_name = "salon-rg"

vnet_name          = "salon-vnet"
vnet_address_space = ["10.0.0.0/16"]

aks_subnet_name     = "subnet-aks"
aks_subnet_prefixes = ["10.0.1.0/24"]

appgw_subnet_name     = "subnet-appgw"
appgw_subnet_prefixes = ["10.0.2.0/24"]

acr_name = "myacr10"

aks_name           = "salon-aks"
aks_dns_prefix     = "salonaks"
aks_node_count     = 2
aks_vm_size        = "Standard_DS2_v2"
aks_service_cidr   = "10.1.0.0/16"
aks_dns_service_ip = "10.1.0.10"

postgres_server_name    = "salon-pg-server"
postgres_admin_username = "Nader"
postgres_admin_password = "AdminAuth123"

postgres_sku_name   = "B_Standard_B1ms"
postgres_storage_mb = 32768
postgres_version    = "14"

postgres_databases = [
  "auracut_auth",
  "auracut_user",
  "auracut_booking",
  "auracut_reservations",
  "auracut_promotion",
  "auracut_notification"
]

tags = {
  project     = "salon"
  environment = "dev"
  managed_by  = "terraform"
}