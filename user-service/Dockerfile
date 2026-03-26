FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN addgroup -S app && adduser -S app -G app
USER app
EXPOSE 3002
CMD ["node", "server.js"]
