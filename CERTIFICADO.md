# 📝 Guía de Certificado Digital para Facturación Electrónica

## ¿Qué es un Certificado Digital?

Un certificado digital es un archivo electrónico que contiene información que permite identificar al titular del mismo. En Ecuador, es obligatorio para la firma electrónica de comprobantes electrónicos que se envían al SRI.

## Entidades Emisoras Autorizadas en Ecuador

Las siguientes entidades están autorizadas para emitir certificados digitales en Ecuador:

1. **Banco Central del Ecuador**
   - Web: https://www.eci.bce.ec/
   - Email: info@eci.bce.ec

2. **Security Data**
   - Web: https://www.securitydata.net.ec/
   - Email: info@securitydata.net.ec

3. **ANF AC**
   - Web: https://www.anf.es/
   
## Requisitos para Obtener un Certificado Digital

### Para Personas Naturales:
- Cédula de identidad vigente
- Certificado de votación actualizado
- RUC actualizado
- Correo electrónico personal

### Para Empresas:
- RUC de la empresa
- Cédula del representante legal
- Nombramiento del representante legal
- Escritura de constitución de la empresa
- Correo electrónico corporativo

## Proceso de Obtención

1. **Contactar a la Entidad Emisora**: Elegir una de las entidades autorizadas listadas arriba
2. **Presentar Documentación**: Enviar los documentos requeridos
3. **Verificación de Identidad**: La entidad verificará tu identidad (puede ser presencial o video llamada)
4. **Pago**: Realizar el pago correspondiente (el costo varía según la entidad)
5. **Recepción del Certificado**: Recibirás un archivo .p12 o .pfx y una contraseña

## Costos Aproximados

- Los certificados digitales tienen un costo que varía entre $50 y $120 USD dependiendo de la entidad emisora
- La vigencia típica es de 1 a 3 años

## Instalación del Certificado en el Sistema

### 1. Ubicar el Archivo

Coloca tu archivo de certificado (.p12 o .pfx) en la carpeta `certificates/` del proyecto:

```bash
cp /ruta/al/certificado.p12 ./certificates/signature.p12
```

### 2. Configurar Variables de Entorno

Actualiza el archivo `.env` con la información de tu certificado:

```env
SIGNATURE_PATH=./certificates/signature.p12
SIGNATURE_PASSWORD=tu_contraseña_del_certificado
```

### 3. Verificar el Certificado

Puedes verificar que el certificado es válido usando OpenSSL:

```bash
# Ver información del certificado
openssl pkcs12 -in certificates/signature.p12 -nokeys -info

# Extraer el certificado
openssl pkcs12 -in certificates/signature.p12 -clcerts -nokeys -out certificate.pem

# Ver fechas de validez
openssl x509 -in certificate.pem -noout -dates
```

## Renovación del Certificado

- Los certificados tienen fecha de expiración
- Debes renovarlos antes de que expiren para evitar interrupciones
- El proceso de renovación es similar al de obtención inicial
- Algunas entidades ofrecen descuentos en renovaciones

## Seguridad del Certificado

⚠️ **IMPORTANTE**: El certificado digital es personal e intransferible

- **Nunca compartas** tu archivo .p12/.pfx ni tu contraseña
- Guarda **copias de respaldo** en lugares seguros
- Si sospechas que está comprometido, **revócalo inmediatamente**
- No lo subas a repositorios públicos
- Usa contraseñas fuertes

## Revocación de Certificado

Si tu certificado es comprometido o robado:

1. Contacta inmediatamente a la entidad emisora
2. Solicita la revocación del certificado
3. Obtén un nuevo certificado
4. Actualiza la configuración de tu sistema

## Problemas Comunes

### Error de Contraseña Incorrecta
- Verifica que la contraseña en el `.env` sea correcta
- La contraseña es case-sensitive

### Certificado Expirado
- Verifica la fecha de expiración con `openssl`
- Renueva el certificado si está expirado

### Archivo No Encontrado
- Verifica que la ruta en `SIGNATURE_PATH` sea correcta
- Asegúrate de que el archivo existe en la ubicación especificada

## Formato del Certificado

El sistema acepta certificados en formato:
- **.p12** (PKCS#12)
- **.pfx** (Personal Information Exchange)

Si tienes el certificado en otro formato, puedes convertirlo:

```bash
# De PEM a P12
openssl pkcs12 -export -out certificate.p12 -inkey privateKey.key -in certificate.crt

# De PFX a P12 (usualmente son el mismo formato)
cp certificate.pfx certificate.p12
```

## Contacto y Soporte

Para más información sobre certificados digitales en Ecuador:
- **SRI**: https://www.sri.gob.ec/
- **Ministerio de Telecomunicaciones**: https://www.telecomunicaciones.gob.ec/

## Referencias

- [Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos](https://www.telecomunicaciones.gob.ec/wp-content/uploads/2020/01/Ley-de-Comercio-Electr%C3%B3nico-Firmas-Electr%C3%B3nicas-y-Mensajes-de-Datos.pdf)
- [Guía del SRI para Facturación Electrónica](https://www.sri.gob.ec/facturacion-electronica)

---

**Nota**: Esta información es una guía general. Los requisitos y procedimientos pueden variar según la entidad emisora y estar sujetos a cambios. Siempre verifica con la entidad emisora elegida para obtener información actualizada.
