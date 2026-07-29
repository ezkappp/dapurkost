FROM php:8.3-apache
RUN echo "DOCKERFILE VERSION 2"

# Ekstensi PHP yang dibutuhkan (koneksi MySQL)
RUN docker-php-ext-install pdo pdo_mysql

# Aktifkan mod_rewrite (dipakai backend/public/.htaccess untuk routing API)
RUN a2enmod rewrite

# Fix "AH00534: More than one MPM loaded": image dasar ini kadang punya
# mpm_event/mpm_worker ikut ke-load bareng mpm_prefork. mod_php cuma
# kompatibel dengan mpm_prefork, jadi matikan yang lain secara eksplisit.
RUN (a2dismod mpm_event || true) && (a2dismod mpm_worker || true) && a2enmod mpm_prefork

# Izinkan .htaccess override (default image ini AllowOverride None)
RUN sed -i '/<Directory \/var\/www\/>/,/<\/Directory>/ s/AllowOverride None/AllowOverride All/' /etc/apache2/apache2.conf

# Copy seluruh project (backend + frontend + database) ke document root.
# DocumentRoot sengaja dibiarkan di root project (bukan di /public) supaya
# path relatif "../../backend/public" yang dipakai frontend/*.html tidak
# perlu diubah sama sekali.
COPY . /var/www/html/

# Railway inject $PORT secara dinamis saat runtime, jadi port final diatur
# lewat entrypoint script (bukan hardcode di sini), lihat entrypoint.sh.
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
CMD ["apache2-foreground"]