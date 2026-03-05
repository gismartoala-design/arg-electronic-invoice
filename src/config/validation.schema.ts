import Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  // Database
  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_DATABASE: Joi.string().default('electronic_invoice'),
  DB_SYNC: Joi.boolean().default(false),

  // SRI
  SRI_WS_RECEPTION_URL: Joi.string().uri().default('https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl'),
  SRI_WS_AUTHORIZATION_URL: Joi.string().uri().default('https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'),

  // Digital Signature
  SIGNATURE_PATH: Joi.string().default('./certificates/signature.p12'),
  SIGNATURE_PASSWORD: Joi.string().allow('').default(''),

  // Company
  COMPANY_RUC: Joi.string().length(13).default('1234567890001'),
  COMPANY_NAME: Joi.string().default('Empresa Demo'),
  COMPANY_TRADENAME: Joi.string().default('Empresa Demo'),
  COMPANY_ADDRESS: Joi.string().default('Dirección Demo'),
  COMPANY_EMAIL: Joi.string().email().default('demo@example.com'),
  COMPANY_PHONE: Joi.string().default('0999999999'),

  // Email
  MAIL_HOST: Joi.string().default('smtp.gmail.com'),
  MAIL_PORT: Joi.number().default(587),
  MAIL_SECURE: Joi.boolean().default(false),
  MAIL_USER: Joi.string().allow('').optional(),
  MAIL_PASSWORD: Joi.string().allow('').optional(),
  MAIL_FROM: Joi.string().email().default('demo@example.com'),

  // JWT
  JWT_SECRET: Joi.string().default('default_secret_key_change_me'),
  JWT_EXPIRATION: Joi.string().default('1d'),

  // Storage
  STORAGE_PATH: Joi.string().default('./storage'),
  XML_PATH: Joi.string().default('./storage/xml'),
  PDF_PATH: Joi.string().default('./storage/pdf'),
  MAX_FILE_SIZE: Joi.number().default(5242880),
  ALLOWED_FILE_TYPES: Joi.string().default('.p12,.pfx'),

  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
});
