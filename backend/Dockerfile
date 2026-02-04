FROM php:8.2-apache

# Needed for CodeIgniter (intl) + PostgreSQL
RUN apt-get update && apt-get install -y \
    git unzip libpq-dev libicu-dev \
 && docker-php-ext-install intl pdo pdo_pgsql pgsql \
 && a2enmod rewrite \
 && rm -rf /var/lib/apt/lists/*

# Serve from /public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
ENV COMPOSER_ALLOW_SUPERUSER=1

# Copy app
COPY . .

# Ensure writable exists (prevents WRITEPATH errors)
RUN mkdir -p writable/cache writable/logs writable/session writable/uploads \
 && chown -R www-data:www-data writable \
 && chmod -R 775 writable

# Install deps (creates vendor/)
RUN composer install --no-dev --optimize-autoloader --no-interaction

# HARD CHECK: if vendor is missing, FAIL BUILD (prevents your current runtime error)
RUN test -f vendor/codeigniter4/framework/system/Boot.php

# Start: run migrations then apache (Render Free has no shell)
RUN printf '%s\n' \
'#!/usr/bin/env sh' \
'set -e' \
'php spark migrate --all || true' \
'exec apache2-foreground' \
> /usr/local/bin/start.sh \
 && chmod +x /usr/local/bin/start.sh

CMD ["/usr/local/bin/start.sh"]
