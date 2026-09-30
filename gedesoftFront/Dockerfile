FROM node:22.17.0

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 4000
ENV PORT=4000

CMD ["npm", "run", "serve:ssr:mi-restaurante-frontend"]
