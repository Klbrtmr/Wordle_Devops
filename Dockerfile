FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NODE_ENV=production
ENV PORT=3000
# Opcionálisan: SECRET_WORD override dockerben
# ENV SECRET_WORD=APPLE

EXPOSE 3000

CMD ["npm", "start"]
