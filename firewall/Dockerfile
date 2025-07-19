FROM ubuntu:22.04

# Instalamos nginx, iptables y utilidades necesarias
RUN apt update && \
    apt install -y nginx iptables iproute2 curl net-tools bash gettext-base && \
    rm -rf /var/lib/apt/lists/*

# Copiamos los archivos de configuración
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exponemos el puerto 80
EXPOSE 80

# Ejecutamos el script al iniciar
CMD ["/entrypoint.sh"]