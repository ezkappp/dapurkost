#!/bin/sh
set -e

# Railway inject $PORT secara dinamis saat container start (bukan saat build),
# jadi konfigurasi port Apache harus di-substitusi di sini, bukan di Dockerfile.
PORT="${PORT:-8080}"

sed -i "s/Listen [0-9]*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/:[0-9]*>/:${PORT}>/" /etc/apache2/sites-enabled/000-default.conf

exec "$@"
