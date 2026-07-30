#!/bin/sh
set -e

# Railway inject $PORT secara dinamis saat container start (bukan saat build),
# jadi konfigurasi port Apache harus di-substitusi di sini, bukan di Dockerfile.
PORT="${PORT:-8080}"

sed -i "s/Listen [0-9]*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/:[0-9]*>/:${PORT}>/" /etc/apache2/sites-enabled/000-default.conf

# Fix "More than one MPM loaded" di sini (bukan cuma di Dockerfile), karena
# step install paket lain (docker-php-ext-install) kadang bikin apt
# mengaktifkan lagi mpm_event/mpm_worker lewat post-install script.
# Jalankan tepat sebelum Apache start supaya pasti ini state terakhirnya.
rm -f /etc/apache2/mods-enabled/mpm_event.load \
      /etc/apache2/mods-enabled/mpm_event.conf \
      /etc/apache2/mods-enabled/mpm_worker.load \
      /etc/apache2/mods-enabled/mpm_worker.conf
ln -sf /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load
ln -sf /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf

exec "$@"
