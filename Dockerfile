# ============================================================
# Dockerfile Optimizado y Seguro para Next.js (Standalone)
# ============================================================

FROM node:22-alpine AS base

# 1. Dependencias de construcción
FROM base AS deps
# Actualizar openssl para mitigar CVE-2026-45447 (libcrypto3/libssl3 < 3.5.7)
RUN apk add --no-cache libc6-compat && apk upgrade --no-cache libcrypto3 libssl3
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# 2. Compilación (Builder)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

ARG BACKEND_URL
ENV BACKEND_URL=$BACKEND_URL

RUN npm run build

# 3. Imagen de Producción (Runner) - Minimizado y Seguro
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Actualizar openssl para mitigar CVE-2026-45447 (libcrypto3/libssl3 < 3.5.7)
RUN apk upgrade --no-cache libcrypto3 libssl3

# Crear usuario sin privilegios root (Principio de Menor Privilegio)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Crear directorio de cache y asignar permisos restringidos
RUN mkdir .next && chown -R nextjs:nodejs .next

# Copiar artefactos standalone mínimos
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT=3001
ENV HOSTNAME="0.0.0.0"

# Healthcheck para monitorización continua del contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/ || exit 1

CMD ["node", "server.js"]

