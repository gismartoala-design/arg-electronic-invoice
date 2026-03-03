import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Application
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api/v1'),

  // Database
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_DATABASE: Joi.string().required(),
  DB_SYNC: Joi.boolean().default(false),

  // SRI
  SRI_WS_RECEPTION_URL: Joi.string().uri().required(),
  SRI_WS_AUTHORIZATION_URL: Joi.string().uri().required(),

  // Digital Signature
  SIGNATURE_PATH: Joi.string().required(),
  SIGNATURE_PASSWORD: Joi.string().allow('').optional(),

  // Company
  COMPANY_RUC: Joi.string().length(13).required(),
  COMPANY_NAME: Joi.string().required(),
  COMPANY_TRADENAME: Joi.string().required(),
  COMPANY_ADDRESS: Joi.string().required(),
  COMPANY_EMAIL: Joi.string().email().required(),
  COMPANY_PHONE: Joi.string().required(),

  // Email
  MAIL_HOST: Joi.string().required(),
  MAIL_PORT: Joi.number().default(587),
  MAIL_SECURE: Joi.boolean().default(false),
  MAIL_USER: Joi.string().allow('').optional(),
  MAIL_PASSWORD: Joi.string().allow('').optional(),
  MAIL_FROM: Joi.string().email().required(),

  // JWT
  JWT_SECRET: Joi.string().required(),
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
