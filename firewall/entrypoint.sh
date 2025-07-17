#!/bin/bash

echo "⚙️  Configurando reglas de iptables..."

iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Permitir tráfico local (loopback)
iptables -A INPUT -i lo -j ACCEPT

# Permitir respuestas a conexiones establecidas
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Permitir tráfico HTTP entrante (puerto 80 del contenedor)
iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Redireccionar tráfico hacia angular-frontend
apt update && apt install -y iproute2 iputils-ping curl net-tools iptables

ANGULAR_IP=$(getent hosts angular-frontend | awk '{ print $1 }')
BACKEND_IP=$(getent hosts backend-api | awk '{ print $1 }')

echo "Angular IP: $ANGULAR_IP"
echo "Backend IP: $BACKEND_IP"

echo "✅ Firewall configurado. Ejecutando nginx..."

tail -f /dev/null
