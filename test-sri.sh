#!/bin/bash

# Script para probar la integración con el SRI

echo "🧪 Probando Integración con el SRI"
echo "=================================="
echo ""

BASE_URL="http://localhost:3000/api/v1"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar que el servidor esté corriendo
echo "1️⃣  Verificando servidor..."
if curl -s "$BASE_URL/sri/connectivity" > /dev/null; then
    echo -e "${GREEN}✅ Servidor corriendo${NC}"
else
    echo -e "${RED}❌ Servidor no disponible. Ejecuta: npm run start:dev${NC}"
    exit 1
fi

echo ""

# 2. Verificar conectividad con SRI
echo "2️⃣  Verificando conectividad con SRI..."
CONNECTIVITY=$(curl -s "$BASE_URL/sri/connectivity")
echo "$CONNECTIVITY" | jq '.'

RECEPTION=$(echo "$CONNECTIVITY" | jq -r '.reception')
AUTHORIZATION=$(echo "$CONNECTIVITY" | jq -r '.authorization')

if [ "$RECEPTION" == "true" ] && [ "$AUTHORIZATION" == "true" ]; then
    echo -e "${GREEN}✅ Conectividad OK${NC}"
else
    echo -e "${YELLOW}⚠️  Usando modo MOCK${NC}"
fi

echo ""

# 3. Verificar certificado digital
echo "3️⃣  Verificando certificado digital..."
CERT_STATUS=$(curl -s "$BASE_URL/signature/certificate/verify")
echo "$CERT_STATUS" | jq '.'

IS_VALID=$(echo "$CERT_STATUS" | jq -r '.isValid')

if [ "$IS_VALID" == "true" ]; then
    echo -e "${GREEN}✅ Certificado válido${NC}"
else
    echo -e "${RED}❌ Certificado inválido o no configurado${NC}"
fi

echo ""

# 4. Verificar información del certificado
echo "4️⃣  Información del certificado..."
CERT_INFO=$(curl -s "$BASE_URL/signature/certificate/info")
DAYS=$(echo "$CERT_INFO" | jq -r '.daysUntilExpiration')

if [ "$DAYS" -lt 30 ]; then
    echo -e "${RED}⚠️  Certificado expira en $DAYS días - RENOVAR PRONTO${NC}"
elif [ "$DAYS" -lt 90 ]; then
    echo -e "${YELLOW}⚠️  Certificado expira en $DAYS días${NC}"
else
    echo -e "${GREEN}✅ Certificado válido por $DAYS días${NC}"
fi

echo ""

# 5. Listar emisores
echo "5️⃣  Verificando emisores registrados..."
ISSUERS=$(curl -s "$BASE_URL/issuers")
ISSUER_COUNT=$(echo "$ISSUERS" | jq '. | length')

if [ "$ISSUER_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ $ISSUER_COUNT emisor(es) registrado(s)${NC}"
    echo "$ISSUERS" | jq -r '.[] | "\(.ruc) - \(.razonSocial)"'
else
    echo -e "${YELLOW}⚠️  No hay emisores registrados. Ejecuta: npm run seed${NC}"
fi

echo ""

# 6. Estadísticas de facturas
echo "6️⃣  Estadísticas de facturas..."
INVOICES=$(curl -s "$BASE_URL/invoices?limit=100")
TOTAL=$(echo "$INVOICES" | jq '.meta.totalItems // 0')
AUTHORIZED=$(echo "$INVOICES" | jq '[.data[] | select(.estado == "AUTORIZADA")] | length')
DRAFT=$(echo "$INVOICES" | jq '[.data[] | select(.estado == "BORRADOR")] | length')
IN_PROCESS=$(echo "$INVOICES" | jq '[.data[] | select(.estado == "EN_PROCESO")] | length')

echo "  Total: $TOTAL"
echo "  Autorizadas: $AUTHORIZED"
echo "  Borradores: $DRAFT"
echo "  En proceso: $IN_PROCESS"

echo ""
echo "=================================="
echo -e "${GREEN}✅ Verificación completada${NC}"
echo ""
echo "📚 Para más información:"
echo "  - Swagger: $BASE_URL/docs"
echo "  - Quickstart: cat QUICKSTART.md"
echo "  - Integración SRI: cat INTEGRACION_SRI.md"
echo "  - Firma Digital: cat FIRMA_DIGITAL.md"
