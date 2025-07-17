FROM ubuntu:22.04

# Instalamos utilidades necesarias para iptables y pruebas
RUN apt update && \
    apt install -y iptables iproute2 curl net-tools bash

# Copiamos el script que aplica las reglas
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Ejecutamos el script al iniciar
CMD ["/entrypoint.sh"]

