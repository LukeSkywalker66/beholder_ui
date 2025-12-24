FROM node:18-alpine

WORKDIR /app

# Copiamos package.json y lock para instalar dependencias primero (cache)
COPY package*.json ./
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de Vite (generalmente 5173 o 3000)
EXPOSE 5173

# Comando de arranque (igual que Emerald)
CMD ["npm", "run", "dev", "--", "--host"]