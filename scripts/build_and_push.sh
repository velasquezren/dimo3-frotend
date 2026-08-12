#!/usr/bin/env bash
# Script para construir y publicar la imagen a Azure Container Registry (ACR)
set -euo pipefail

ACR_NAME="${ACR_NAME:-dimo3canacr}"
ACR_REGISTRY="${ACR_NAME}.azurecr.io"
IMAGE_NAME="${IMAGE_NAME:-dimo-frontend}"
BACKEND_URL="${BACKEND_URL:-http://backend:3000}"

echo "=========================================="
echo " 🚀 Construyendo e iniciando sesión en Azure ACR: ${ACR_REGISTRY}"
echo "=========================================="

# Login a Azure ACR
az acr login --name "${ACR_NAME}"

# Construcción de la imagen Docker optimizada (standalone)
echo ">>> Construyendo imagen Docker para Next.js..."
docker build \
  --build-arg BACKEND_URL="${BACKEND_URL}" \
  -t "${ACR_REGISTRY}/${IMAGE_NAME}:latest" \
  -t "${ACR_REGISTRY}/${IMAGE_NAME}:1.0.0" \
  .

# Push a Azure ACR
echo ">>> Subiendo imagen a Azure ACR..."
docker push "${ACR_REGISTRY}/${IMAGE_NAME}:latest"
docker push "${ACR_REGISTRY}/${IMAGE_NAME}:1.0.0"

echo ""
echo "=========================================="
echo " 🎉 ¡PROCESO COMPLETADO CON ÉXITO!"
echo " Se ha publicado la imagen en Azure ACR:"
echo " - ${ACR_REGISTRY}/${IMAGE_NAME}:latest"
echo "=========================================="
