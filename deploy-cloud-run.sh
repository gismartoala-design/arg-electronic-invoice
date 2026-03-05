#!/bin/bash

# Script de despliegue rápido en Cloud Run
# Uso: ./deploy-cloud-run.sh

set -e

echo "🚀 Desplegando arg-electronic-invoice a Cloud Run..."

# Validar que gcloud esté instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI no está instalado"
    echo "Instalar desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Obtener PROJECT_ID actual
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No hay proyecto configurado"
    echo "Ejecuta: gcloud config set project TU-PROJECT-ID"
    exit 1
fi

echo "📦 Proyecto: $PROJECT_ID"
echo ""

# Confirmar
read -p "¿Continuar con el despliegue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Despliegue cancelado"
    exit 0
fi

echo ""
echo "1️⃣  Construyendo imagen Docker..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/arg-electronic-invoice:latest .

echo ""
echo "2️⃣  Desplegando a Cloud Run..."
gcloud run deploy arg-electronic-invoice \
  --image=gcr.io/$PROJECT_ID/arg-electronic-invoice:latest \
  --region=us-east1 \
  --platform=managed \
  --allow-unauthenticated \
  --service-account=facturas-storage-sa@$PROJECT_ID.iam.gserviceaccount.com \
  --memory=512Mi \
  --cpu=1 \
  --timeout=300 \
  --concurrency=80 \
  --min-instances=0 \
  --max-instances=10

echo ""
echo "✅ Despliegue completado!"
echo ""
echo "🌐 URL del servicio:"
gcloud run services describe arg-electronic-invoice \
  --region=us-east1 \
  --format='value(status.url)'

echo ""
echo "📊 Ver logs:"
echo "   gcloud run services logs read arg-electronic-invoice --region=us-east1 --follow"
echo ""
echo "🔍 Ver en consola:"
echo "   https://console.cloud.google.com/run/detail/us-east1/arg-electronic-invoice"
