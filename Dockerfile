FROM node:18.20.3

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3001

# Comando para iniciar el servidor en producción
CMD ["npm", "start"]
