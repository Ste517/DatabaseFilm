#!/bin/bash

# Create certs directory
mkdir -p certs

# Generate self-signed certificate if not exists
if [ ! -f certs/selfsigned.crt ]; then
    echo "Generating self-signed certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout certs/selfsigned.key \
        -out certs/selfsigned.crt \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
fi

echo "Starting Docker Compose..."
# Check if docker-compose exists, else try docker compose
if command -v docker-compose &> /dev/null; then
    docker-compose up --build -d
else
    docker compose up --build -d
fi

echo "Application started!"
echo "Frontend: https://localhost"
echo "Backend: http://localhost:8000 (Internal)"
