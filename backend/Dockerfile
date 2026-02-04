FROM php:8.2-apache

# Enable Apache modules
RUN a2enmod rewrite headers

# Install system packages + PHP extensions CI4 commonly needs
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libpq-dev \
    unzip \
 && docker-php-ext-install intl mysqli pgsql pdo pdo_mysql pdo_pgsql \
 && rm -rf /var/lib/apt/lists/*

# Set Apache DocumentRoot to /public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf

# Replace default vhost
COPY apache.conf /etc/apache2/sites-available/000-default.conf

# Set working directory
WORKDIR /var/www/html

# Copy project files
COPY . .

# Permissions for CI writable
RUN chown -R www-data:www-data writable \
 && chmod -R 775 writable

EXPOSE 80
