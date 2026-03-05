# Guía de Despliegue en Google Cloud Run

## 📋 Prerequisitos

- Cuenta de Google Cloud con billing activado
- gcloud CLI instalado: https://cloud.google.com/sdk/docs/install
- Proyecto de GCP creado

---

## 🚀 Despliegue Paso a Paso

### 1. Configuración inicial de gcloud

```bash
# Autenticarse
gcloud auth login

# Configurar proyecto
export PROJECT_ID="tu-project-id"
gcloud config set project $PROJECT_ID

# Habilitar APIs necesarias
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  containerregistry.googleapis.com \
  storage-api.googleapis.com \
  secretmanager.googleapis.com
```

### 2. Crear el bucket de GCS

```bash
# Crear bucket para facturas
gsutil mb -c standard -l us-east1 gs://arg-facturas-prod

# Verificar
gsutil ls
```

### 3. Crear Service Account

```bash
# Crear service account
gcloud iam service-accounts create facturas-storage-sa \
  --display-name="Facturas Storage Service Account" \
  --description="Service Account para acceso a GCS y Cloud Run"

# Asignar permisos de Storage
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:facturas-storage-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Verificar
gcloud iam service-accounts list
```

### 4. Crear Secrets en Secret Manager

```bash
# Crear secret para password de BD
echo -n "tu-password-bd" | gcloud secrets create db-password \
  --data-file=- \
  --replication-policy="automatic"

# Crear secret para password de firma digital
echo -n "tu-password-firma" | gcloud secrets create signature-password \
  --data-file=- \
  --replication-policy="automatic"

# Crear secret para JWT
echo -n "tu-jwt-secret-produccion" | gcloud secrets create jwt-secret \
  --data-file=- \
  --replication-policy="automatic"

# Dar permisos al service account para leer secrets
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:facturas-storage-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding signature-password \
  --member="serviceAccount:facturas-storage-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding jwt-secret \
  --member="serviceAccount:facturas-storage-sa@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 5. Subir certificado .p12 al bucket

```bash
# Subir certificado de firma digital
gsutil cp ./certificates/tu-certificado.p12 gs://arg-facturas-prod/certificates/

# Hacer el archivo privado
gsutil acl ch -u AllUsers:R gs://arg-facturas-prod/certificates/tu-certificado.p12 -d
```

### 6. Despliegue Manual (Primera vez)

```bash
# Construir imagen localmente (opcional, para probar)
docker build -t gcr.io/$PROJECT_ID/arg-electronic-invoice:latest .

# Probar localmente
docker run -p 8080:8080 \
  -e NODE_ENV=development \
  -e STORAGE_PROVIDER=local \
  -e DB_HOST=194.140.198.128 \
  -e DB_PORT=5432 \
  -e DB_USERNAME=emerson \
  -e DB_PASSWORD=memerson19 \
  -e DB_DATABASE=electronic_invoice \
  gcr.io/$PROJECT_ID/arg-electronic-invoice:latest

# Push a GCR
docker push gcr.io/$PROJECT_ID/arg-electronic-invoice:latest

# Desplegar a Cloud Run
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
  --max-instances=10 \
  --set-env-vars="NODE_ENV=production,\
STORAGE_PROVIDER=gcs,\
GCS_BUCKET=arg-facturas-prod,\
DB_HOST=194.140.198.128,\
DB_PORT=5432,\
DB_USERNAME=emerson,\
DB_DATABASE=electronic_invoice,\
DB_SYNC=false,\
SRI_WS_RECEPTION_URL=https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl,\
SRI_WS_AUTHORIZATION_URL=https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl,\
SIGNATURE_PATH=gs://arg-facturas-prod/certificates/tu-certificado.p12,\
API_PREFIX=api/v1,\
PORT=8080" \
  --set-secrets="DB_PASSWORD=db-password:latest,\
SIGNATURE_PASSWORD=signature-password:latest,\
JWT_SECRET=jwt-secret:latest"
```

### 7. Configurar Cloud Build para CI/CD automatizado

```bash
# Dar permisos a Cloud Build para desplegar en Cloud Run
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')@cloudbuild.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')@cloudbuild.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Conectar repositorio (GitHub, GitLab, Bitbucket)
# Ir a: https://console.cloud.google.com/cloud-build/triggers

# Crear trigger automático que use cloudbuild.yaml
gcloud builds triggers create github \
  --repo-name="arg-electronic-invoice" \
  --repo-owner="tu-usuario" \
  --branch-pattern="^main$" \
  --build-config="cloudbuild.yaml"
```

### 8. Despliegue con Cloud Build (desde código)

```bash
# Desplegar manualmente desde local
gcloud builds submit --config=cloudbuild.yaml .

# O hacer push a main y se despliega automáticamente
git push origin main
```

---

## 🔍 Verificación

```bash
# Obtener URL del servicio
gcloud run services describe arg-electronic-invoice \
  --region=us-east1 \
  --format='value(status.url)'

# Probar health check
curl https://tu-servicio-url.run.app/health

# Ver logs en tiempo real
gcloud run services logs read arg-electronic-invoice \
  --region=us-east1 \
  --limit=50 \
  --follow
```

---

## 📊 Monitoreo

### Ver logs
```bash
# Logs en consola
gcloud run services logs read arg-electronic-invoice --region=us-east1

# O en Cloud Console
# https://console.cloud.google.com/run/detail/us-east1/arg-electronic-invoice/logs
```

### Métricas
```bash
# Ver métricas (requests, latencia, errores)
# https://console.cloud.google.com/run/detail/us-east1/arg-electronic-invoice/metrics
```

### Alertas
```bash
# Crear alerta de errores
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Cloud Run - Error Rate Alert" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=0.05
```

---

## 🔄 Actualizaciones

### Despliegue de nueva versión
```bash
# Opción 1: Automático (push a main)
git add .
git commit -m "feat: nueva funcionalidad"
git push origin main

# Opción 2: Manual con Cloud Build
gcloud builds submit --config=cloudbuild.yaml .

# Opción 3: Actualizar solo variables de entorno
gcloud run services update arg-electronic-invoice \
  --region=us-east1 \
  --set-env-vars="NUEVA_VAR=valor"
```

### Rollback a versión anterior
```bash
# Listar revisiones
gcloud run revisions list --service=arg-electronic-invoice --region=us-east1

# Hacer rollback
gcloud run services update-traffic arg-electronic-invoice \
  --region=us-east1 \
  --to-revisions=REVISION_NAME=100
```

---

## 💰 Estimación de Costos

**Cloud Run (512 MB RAM, 1 CPU):**
- Primeras 2 millones requests/mes: GRATIS
- Después: $0.40 por millón de requests
- Compute time: $0.00002400 por vCPU-second
- Memory: $0.00000250 per GiB-second

**Cloud Storage:**
- 10,000 facturas/mes: ~$0.22
- 100,000 facturas/mes: ~$2.13

**Egress (salida de datos):**
- Primeros 100 GB/mes: GRATIS

**Ejemplo: 50,000 facturas/mes**
- Cloud Run: ~$5-10/mes
- Cloud Storage: ~$1/mes
- **Total: ~$6-11/mes**

---

## 🔒 Seguridad

### Network Egress Control
```bash
# Crear VPC Connector (opcional, si necesitas acceso a VPC privada)
gcloud compute networks vpc-access connectors create facturas-connector \
  --region=us-east1 \
  --range=10.8.0.0/28

# Actualizar Cloud Run para usar VPC
gcloud run services update arg-electronic-invoice \
  --region=us-east1 \
  --vpc-connector=facturas-connector
```

### Autenticación requerida
```bash
# Cambiar a requerir autenticación
gcloud run services update arg-electronic-invoice \
  --region=us-east1 \
  --no-allow-unauthenticated

# Crear usuario de servicio para acceso programático
gcloud run services add-iam-policy-binding arg-electronic-invoice \
  --region=us-east1 \
  --member="serviceAccount:tu-app@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.invoker"
```

---

## 🐛 Troubleshooting

### Ver errores de despliegue
```bash
gcloud builds list --limit=5
gcloud builds log BUILD_ID
```

### Conectarse al contenedor (debugging)
```bash
# No es posible SSH a Cloud Run, pero puedes:
# 1. Ver logs detallados
gcloud run services logs read arg-electronic-invoice --region=us-east1 --limit=100

# 2. Ejecutar localmente la misma imagen
docker run -it --entrypoint=/bin/sh gcr.io/$PROJECT_ID/arg-electronic-invoice:latest
```

### Problemas comunes

**Error: "Service account does not have permission"**
```bash
# Verificar permisos
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:facturas-storage-sa@$PROJECT_ID.iam.gserviceaccount.com"
```

**Error: "Cannot access secret"**
```bash
# Verificar secrets
gcloud secrets list
gcloud secrets versions access latest --secret="db-password"
```

**Timeout en requests**
```bash
# Aumentar timeout
gcloud run services update arg-electronic-invoice \
  --region=us-east1 \
  --timeout=600
```

---

## 📚 Referencias

- Cloud Run Docs: https://cloud.google.com/run/docs
- Cloud Build: https://cloud.google.com/build/docs
- GCS: https://cloud.google.com/storage/docs
- Secret Manager: https://cloud.google.com/secret-manager/docs
