FROM php:8.2-apache

# -----------------------------
# System deps + PHP extensions
# -----------------------------
RUN apt-get update && apt-get install -y \
    git unzip libpq-dev libicu-dev \
 && docker-php-ext-install intl pdo pdo_pgsql pgsql \
 && a2enmod rewrite \
 && rm -rf /var/lib/apt/lists/*

# -----------------------------
# Apache: serve from /public
# -----------------------------
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf \
 && sed -ri 's!/var/www/!/var/www/html/public!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf || true

# (Optional but helpful) Fix AllowOverride so CI routes work with .htaccess
RUN sed -ri 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

WORKDIR /var/www/html

# -----------------------------
# Composer
# -----------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# -----------------------------
# Copy app
# -----------------------------
COPY . .

# -----------------------------
# Writable permissions
# -----------------------------
RUN mkdir -p writable/cache writable/logs writable/session writable/uploads \
 && chown -R www-data:www-data writable \
 && chmod -R 775 writable

# -----------------------------
# Install deps
# -----------------------------
RUN composer install --no-dev --optimize-autoloader --no-interaction

# HARD CHECK: ensure framework exists
RUN test -f vendor/codeigniter4/framework/system/Boot.php

# -----------------------------
# Start script
# - Optional migrations controlled by RUN_MIGRATIONS=true
# - Never swallow errors silently
# -----------------------------
RUN printf '%s\n' \
'#!/usr/bin/env sh' \
'set -e' \
'' \
'echo "Starting CodeIgniter on Apache..."' \
'' \
'# Optional: run migrations only when enabled' \
'if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then' \
'  echo "RUN_MIGRATIONS=true -> running migrations..."' \
'  php spark migrate --all' \
'else' \
'  echo "RUN_MIGRATIONS is not true -> skipping migrations."' \
'fi' \
'' \
'exec apache2-foreground' \
> /usr/local/bin/start.sh \
 && chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]
