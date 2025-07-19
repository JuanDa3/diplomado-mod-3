#!/bin/bash

echo "🔥 Configurando Firewall..."

# Configurar iptables básico
echo "⚙️  Configurando reglas de iptables..."
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# Permitir tráfico local (loopback)
iptables -A INPUT -i lo -j ACCEPT

# Permitir respuestas a conexiones establecidas
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Permitir tráfico HTTP entrante (puerto 80)
iptables -A INPUT -p tcp --dport 80 -j ACCEPT

# Permitir tráfico DNS (para resolución de nombres)
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT

echo "✅ Reglas de iptables configuradas"

# Obtener IPs de los servicios
echo "🔍 Obteniendo IPs de servicios..."
ANGULAR_IP=$(getent hosts angular-frontend | awk '{ print $1 }')
BACKEND_IP=$(getent hosts backend-api | awk '{ print $1 }')

echo "📍 Angular IP: $ANGULAR_IP"
echo "📍 Backend IP: $BACKEND_IP"

# Verificar que los servicios estén disponibles
echo "🔍 Verificando conectividad..."
while ! curl -s "http://$ANGULAR_IP:80/health" > /dev/null 2>&1; do
    echo "⏳ Esperando que Angular esté disponible..."
    sleep 5
done

while ! curl -s "http://$BACKEND_IP:3000" > /dev/null 2>&1; do
    echo "⏳ Esperando que Backend esté disponible..."
    sleep 5
done

echo "✅ Servicios verificados"

# Generar configuración de nginx con las IPs reales
echo "⚙️  Configurando nginx..."
export ANGULAR_IP BACKEND_IP
envsubst '${ANGULAR_IP} ${BACKEND_IP}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Verificar configuración de nginx
nginx -t
if [ $? -eq 0 ]; then
    echo "✅ Configuración de nginx válida"
else
    echo "❌ Error en configuración de nginx"
    exit 1
fi

# Iniciar nginx
echo "🚀 Iniciando nginx..."
nginx -g "daemon off;" &

echo "🔥 Firewall configurado y nginx iniciado"
echo "📡 Firewall escuchando en puerto 80"
echo "🔀 Redirigiendo:"
echo "   - / -> Angular ($ANGULAR_IP:80)"
echo "   - /api/ -> Backend ($BACKEND_IP:3000)"

# Mantener el contenedor corriendo
wait