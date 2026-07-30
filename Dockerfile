FROM php:8.3-apache

# Ekstensi PHP yang dibutuhkan (koneksi MySQL)
RUN docker-php-ext-install pdo pdo_mysql

# Aktifkan mod_rewrite (dipakai backend/public/.htaccess untuk routing API)
RUN a2enmod rewrite

# Fix "AH00534: More than one MPM loaded" secara pasti: hapus langsung
# symlink mpm_event & mpm_worker dari mods-enabled (bukan andalkan a2dismod
# yang kadang tidak konsisten karena Docker layer caching), lalu pastikan
# hanya mpm_prefork yang aktif (satu-satunya yang kompatibel dengan mod_php).
RUN rm -f /etc/apache2/mods-enabled/mpm_event.load \
          /etc/apache2/mods-enabled/mpm_event.conf \
          /etc/apache2/mods-enabled/mpm_worker.load \
          /etc/apache2/mods-enabled/mpm_worker.conf \
    && ln -sf /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load \
    && ln -sf /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf

# Izinkan .htaccess override (default image ini AllowOverride None)
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Copy seluruh project (backend + frontend + database) ke document root.
COPY . /var/www/html/

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["apache2-foreground"]
