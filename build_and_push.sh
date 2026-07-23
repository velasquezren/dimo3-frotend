#!/usr/bin/env bash
set -e

echo "=========================================="
echo " 1. Construyendo y Subiendo IMAGEN OPTIMIZADA"
echo "=========================================="
docker build -f Dockerfile -t httprene/dimo3-frontend:optimized -t httprene/dimo3-frontend:latest .
docker push httprene/dimo3-frontend:optimized
docker push httprene/dimo3-frontend:latest

echo ""
echo "=========================================="
echo " 2. Construyendo y Subiendo IMAGEN UNOPTIMIZED"
echo "=========================================="
docker build -f Dockerfile.unoptimized -t httprene/dimo3-frontend:unoptimized .
docker push httprene/dimo3-frontend:unoptimized

echo ""
echo "=========================================="
echo " 🎉 ¡PROCESO COMPLETADO CON ÉXITO!"
echo " Se han subido ambas imágenes a Docker Hub:"
echo " - httprene/dimo3-frontend:optimized"
echo " - httprene/dimo3-frontend:unoptimized"
echo "=========================================="
