# Etapa 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias para compilar módulos nativos (canvas)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Instalar dependencias (incluidas devDependencies para compilar)
RUN npm ci

# Copiar código fuente y configuración
COPY src ./src

# Compilar aplicación
RUN npm run build

# Eliminar devDependencies
RUN npm prune --production

# Etapa 2: Production
FROM node:24-alpine

# Instalar dependencias de runtime para canvas y dumb-init
RUN apk add --no-cache \
    dumb-init \
    cairo \
    pango \
    jpeg \
    giflib \
    librsvg \
    # Dependencias de Puppeteer/Chromium para Alpine
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Configurar Puppeteer para que no descargue Chromium y use el del sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copiar node_modules desde builder
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copiar aplicación compilada
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copiar package.json (necesario para metadata)
COPY --chown=nestjs:nodejs package*.json ./

# Crear directorio storage (si usa local como fallback)
RUN mkdir -p /app/storage && chown -R nestjs:nodejs /app/storage

# Cambiar a usuario no-root
USER nestjs

# Exponer puerto (Cloud Run inyecta PORT automáticamente)
EXPOSE 8080

# Variables de entorno predeterminadas (se sobrescriben en Cloud Run)
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:8080/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Iniciar aplicación
CMD ["node", "dist/main.js"]
