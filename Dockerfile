# Etapa 1: Build
FROM node:24-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependencias (incluidas devDependencies para compilar)
RUN npm ci

# Copiar código fuente
COPY src ./src

# Compilar aplicación
RUN npm run build

# Eliminar devDependencies
RUN npm prune --production

# Etapa 2: Production
FROM node:24-alpine

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

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
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Usar dumb-init para manejo correcto de señales
ENTRYPOINT ["dumb-init", "--"]

# Iniciar aplicación
CMD ["node", "dist/main.js"]
