# 🧾 Sistema de Facturación Electrónica SRI - Ecuador

Sistema completo de facturación electrónica para Ecuador, desarrollado con NestJS, que permite la generación, firma digital y envío de comprobantes electrónicos al Servicio de Rentas Internas (SRI).

## 📋 Características

- ✅ Generación de comprobantes electrónicos según estándares del SRI
- ✅ Firma digital de documentos XML con certificado .p12
- ✅ Envío y recepción de comprobantes al SRI
- ✅ Consulta de autorización de comprobantes
- ✅ Soporte para múltiples tipos de comprobantes:
  - Facturas
  - Notas de Crédito
  - Notas de Débito
  - Retenciones
  - Guías de Remisión
- ✅ Validación de RUC y cédulas ecuatorianas
- ✅ Generación automática de claves de acceso
- ✅ API REST documentada con Swagger
- ✅ Validación de datos con class-validator
- ✅ Logging de operaciones
- ✅ Manejo global de errores

## 🛠️ Tecnologías

- [NestJS](https://nestjs.com/) - Framework de Node.js
- [TypeScript](https://www.typescriptlang.org/) - Lenguaje de programación
- [Axios](https://axios-http.com/) - Cliente HTTP para consumir servicios del SRI
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser) - Parser y constructor de XML
- [node-forge](https://github.com/digitalbazaar/forge) - Librería de criptografía para firma digital
- [class-validator](https://github.com/typestack/class-validator) - Validación de DTOs
- [dayjs](https://day.js.org/) - Manejo de fechas
- [Swagger](https://swagger.io/) - Documentación de API

## 📦 Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd arg-electronic-invoice

# Instalar dependencias
npm install

# Copiar archivo de configuración
cp .env.example .env

# Editar el archivo .env con tus configuraciones
nano .env
```

## ⚙️ Configuración

### Variables de Entorno

Edita el archivo `.env` con tus configuraciones:

```env
# Configuración de la aplicación
NODE_ENV=development
PORT=3000

# Configuración del SRI
SRI_WS_RECEPTION_URL=https://celery.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl
SRI_WS_AUTHORIZATION_URL=https://celery.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl

# Configuración de firma digital
SIGNATURE_PATH=./certificates/signature.p12
SIGNATURE_PASSWORD=tu_contraseña

# Información de la empresa
COMPANY_RUC=1234567890001
COMPANY_NAME=NOMBRE DE TU EMPRESA
COMPANY_TRADENAME=NOMBRE COMERCIAL
COMPANY_ADDRESS=Dirección de tu empresa
COMPANY_EMAIL=email@empresa.com
COMPANY_PHONE=0999999999
```

### Certificado Digital

1. Coloca tu certificado digital (.p12 o .pfx) en la carpeta `certificates/`
2. Configura la ruta y contraseña en el archivo `.env`

```bash
mkdir certificates
# Copiar tu certificado a la carpeta certificates/
```

## 🚀 Ejecución

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod

# Modo debug
npm run start:debug
```

La aplicación estará disponible en:
- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api/v1/docs

## 📚 Documentación de API

Una vez iniciada la aplicación, accede a la documentación interactiva de Swagger:

```
http://localhost:3000/api/v1/docs
```

### Endpoints Principales

#### Facturas
- `POST /api/v1/invoices` - Crear nueva factura
- `GET /api/v1/invoices` - Listar facturas
- `GET /api/v1/invoices/:id` - Obtener factura por ID
- `POST /api/v1/invoices/:id/authorize` - Autorizar factura en el SRI

#### Notas de Crédito
- `POST /api/v1/credit-notes` - Crear nota de crédito
- `GET /api/v1/credit-notes` - Listar notas de crédito
- `GET /api/v1/credit-notes/:id` - Obtener nota de crédito

#### Notas de Débito
- `POST /api/v1/debit-notes` - Crear nota de débito
- `GET /api/v1/debit-notes` - Listar notas de débito
- `GET /api/v1/debit-notes/:id` - Obtener nota de débito

#### Retenciones
- `POST /api/v1/retentions` - Crear retención
- `GET /api/v1/retentions` - Listar retenciones
- `GET /api/v1/retentions/:id` - Obtener retención

#### Guías de Remisión
- `POST /api/v1/remission-guides` - Crear guía de remisión
- `GET /api/v1/remission-guides` - Listar guías de remisión
- `GET /api/v1/remission-guides/:id` - Obtener guía de remisión

#### SRI
- `POST /api/v1/sri/reception` - Enviar comprobante a recepción
- `GET /api/v1/sri/authorization/:claveAcceso` - Consultar autorización

## 📁 Estructura del Proyecto

```
src/
├── config/                    # Configuraciones
│   ├── configuration.ts       # Configuración general
│   └── validation.schema.ts   # Schema de validación de env
├── modules/                   # Módulos de la aplicación
│   ├── invoice/              # Módulo de facturas
│   ├── credit-note/          # Módulo de notas de crédito
│   ├── debit-note/           # Módulo de notas de débito
│   ├── retention/            # Módulo de retenciones
│   ├── remission-guide/      # Módulo de guías de remisión
│   ├── sri/                  # Módulo de integración con SRI
│   ├── xml-builder/          # Módulo de construcción de XML
│   └── signature/            # Módulo de firma digital
├── shared/                   # Recursos compartidos
│   ├── constants/            # Constantes del SRI
│   ├── dto/                  # DTOs comunes
│   ├── interfaces/           # Interfaces
│   ├── filters/              # Filtros de excepciones
│   ├── interceptors/         # Interceptors
│   └── utils/                # Utilidades
│       ├── access-key.util.ts    # Generación de claves de acceso
│       ├── validation.util.ts    # Validación de RUC/Cédula
│       ├── date.util.ts          # Utilidades de fechas
│       └── format.util.ts        # Utilidades de formato
├── app.module.ts             # Módulo principal
└── main.ts                   # Archivo de arranque
```

## 🔧 Desarrollo

### Tests

```bash
# Tests unitarios
npm run test

# Tests e2e
npm run test:e2e

# Cobertura de tests
npm run test:cov
```

### Linting y Formateo

```bash
# Ejecutar linter
npm run lint

# Formatear código
npm run format
```

## 📖 Guía de Uso

### 1. Crear una Factura

```typescript
POST /api/v1/invoices
Content-Type: application/json

{
  "fechaEmision": "28/02/2026",
  "cliente": {
    "tipoIdentificacion": "04",
    "numeroIdentificacion": "1234567890001",
    "razonSocial": "CLIENTE EJEMPLO S.A.",
    "direccion": "Quito, Ecuador",
    "email": "cliente@example.com"
  },
  "detalles": [
    {
      "codigoPrincipal": "PROD001",
      "descripcion": "Producto de ejemplo",
      "cantidad": 1,
      "precioUnitario": 100.00,
      "descuento": 0,
      "precioTotalSinImpuesto": 100.00
    }
  ],
  "pagos": [
    {
      "formaPago": "01",
      "total": 112.00
    }
  ]
}
```

### 2. Firmar y Enviar al SRI

El proceso de firma y envío al SRI se realiza automáticamente cuando se autoriza una factura:

```typescript
POST /api/v1/invoices/:id/authorize
```

### 3. Consultar Estado de Autorización

```typescript
GET /api/v1/sri/authorization/:claveAcceso
```

## 🔐 Seguridad

- Las contraseñas y certificados no deben ser compartidos
- Usar variables de entorno para información sensible
- El archivo `.env` está excluido del repositorio
- Implementar autenticación JWT para endpoints en producción

## 🌐 Ambientes

### Pruebas (Testing)
```
SRI_WS_RECEPTION_URL=https://celery.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl
SRI_WS_AUTHORIZATION_URL=https://celery.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl
```

### Producción
```
SRI_WS_RECEPTION_URL=https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantes?wsdl
SRI_WS_AUTHORIZATION_URL=https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantes?wsdl
```

## 📝 Notas Importantes

1. **Certificado Digital**: Es necesario contar con un certificado digital válido emitido por las entidades autorizadas en Ecuador
2. **Ambiente de Pruebas**: Se recomienda usar el ambiente de pruebas del SRI antes de pasar a producción
3. **Validaciones**: El sistema incluye validaciones de RUC, cédula y estructura de comprobantes según normativa del SRI
4. **Claves de Acceso**: Se generan automáticamente según el algoritmo del SRI (49 dígitos con verificador módulo 11)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y pertenece a ARGSOFT.

## 👥 Soporte

Para soporte y consultas:
- Email: soporte@argsoft.com
- Documentación del SRI: https://www.sri.gob.ec/

## 🔗 Enlaces Útiles

- [Documentación del SRI](https://www.sri.gob.ec/facturacion-electronica)
- [Especificaciones Técnicas](https://www.sri.gob.ec/DocumentosInformativos/)
- [NestJS Documentation](https://docs.nestjs.com/)

---

Desarrollado con ❤️ por ARGSOFT

$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
