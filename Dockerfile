# Etapa de construcción
FROM node:18-alpine AS builder
WORKDIR /app

# Copia archivos de dependencias
COPY package*.json ./
COPY prisma/schema.prisma ./prisma/ 

# Instala dependencias y construye
RUN npm ci
COPY . .
RUN npm run build

# Etapa de producción
FROM node:18-alpine
WORKDIR /app

# Copia solo lo necesario
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env.prod .env 
COPY --from=builder /app/prisma ./prisma  

# Puerto expuesto y comando de inicio
EXPOSE 3000
CMD ["node", "dist/main.js"]