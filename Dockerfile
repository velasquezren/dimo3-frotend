FROM node:20-alpine3.20 AS base

# 1. Instalar dependencias solo cuando sea necesario
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine para entender por qué se necesita libc6-compat.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Instalar dependencias basado en el package-lock.json
COPY package.json package-lock.json* ./
RUN npm ci

# 2. Reconstruir el código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Deshabilitar telemetría de Next.js durante la build
ENV NEXT_TELEMETRY_DISABLED=1

ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

RUN npm run build

# 3. Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Deshabilitar telemetría de Next.js durante el runtime
ENV NEXT_TELEMETRY_DISABLED=1

# tini como PID 1: reaping de zombies y reenvío de SIGTERM para shutdown gracioso
RUN apk add --no-cache tini && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Setear permisos correctos para el cache de Next.js
RUN mkdir .next && chown nextjs:nodejs .next

# Aprovechar standalone build de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT=3001
ENV HOSTNAME=0.0.0.0

# Verificar que el servidor responde en el puerto expuesto.
# Se usa 127.0.0.1 (en vez de localhost) para no depender de la resolución DNS
# de "localhost" dentro del contenedor, que puede no estar configurada.
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:3001/ || exit 1

# server.js es creado por next build cuando se usa standalone output
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
