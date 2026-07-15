# Dimo Frontend - Panel de Control

Este es el frontend del sistema de gestión **Dimo**, desarrollado con **Next.js** (App Router) y **TypeScript**. Se conecta a un backend Express para gestionar clientes, productos y pedidos.

## Características
- **Clientes**: Registro, edición y desactivación de clientes.
- **Productos**: Gestión de inventario de productos.
- **Pedidos**: Creación y control de estados de pedidos (PENDING, CONFIRMED, DELIVERED, CANCELLED).
- **Integración con Backend**: Proxificación de APIs mediante `rewrites` en Next.js para evitar problemas de CORS.

---

## Configuración y Desarrollo Local

### Requisitos previos
- Node.js v20 o superior
- Tener el backend de Dimo corriendo (por defecto en `http://localhost:5000`)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Ejecutar servidor de desarrollo
El frontend está configurado para correr en el puerto **3001** (para evitar conflictos de puertos con el backend):
```bash
npm run dev
```
Abre [http://localhost:3001](http://localhost:3001) en tu navegador para ver la aplicación.

---

## Integración con la API (Next.js Rewrites)
En lugar de apuntar directamente al backend en el código del navegador, Next.js actúa como proxy. Cualquier petición dirigida a `/api/*` es capturada por Next.js y redirigida a la dirección configurada en la variable `BACKEND_URL` (por defecto `http://localhost:5000`).

Para cambiar la dirección del backend en desarrollo sin modificar el código, puedes pasar la variable de entorno:
```bash
BACKEND_URL=http://tu-servidor-backend:5000 npm run dev
```

---

## Docker y Despliegue en Producción

El proyecto incluye un `Dockerfile` optimizado en múltiples etapas (Multi-stage build) que aprovecha la salida `standalone` de Next.js, reduciendo drásticamente el tamaño de la imagen final.

### Construir la imagen de Docker
Durante la construcción (build time) puedes pasar la URL del backend por defecto:
```bash
docker build -t dimo-frontend --build-arg BACKEND_URL=http://localhost:5000 .
```

### Ejecutar el contenedor
El contenedor expone la aplicación en el puerto **3001**:
```bash
docker run -d -p 3001:3001 -e BACKEND_URL=http://localhost:5000 dimo-frontend
```
En producción, puedes definir la variable `BACKEND_URL` para apuntar a tu contenedor de backend en la red privada de Docker (ej. `http://dimo-backend:5000`).
