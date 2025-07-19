FROM ubuntu:22.04

# Instalamos nginx, iptables, openssl y utilidades necesarias
RUN apt update && \
    apt install -y nginx iptables iproute2 curl net-tools bash gettext-base openssl && \
    rm -rf /var/lib/apt/lists/*

# Crear directorio para certificados SSL
RUN mkdir -p /etc/nginx/ssl

# Generar certificado SSL auto-firmado (para desarrollo/educación)
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx-selfsigned.key \
    -out /etc/nginx/ssl/nginx-selfsigned.crt \
    -subj "/C=CO/ST=Quindio/L=Armenia/O=Diplomado/OU=IT/CN=localhost"

# Generar parámetros Diffie-Hellman para mayor seguridad
RUN openssl dhparam -out /etc/nginx/ssl/dhparam.pem 2048

# Copiamos los archivos de configuración
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exponemos los puertos 80 (redirect) y 443 (HTTPS)
EXPOSE 80 443

# Ejecutamos el script al iniciar
CMD ["/entrypoint.sh"]