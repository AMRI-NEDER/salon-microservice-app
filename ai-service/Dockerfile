FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN addgroup -S app && adduser -S app -G app
USER app
EXPOSE 3007
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3007/health || exit 1
CMD ["node", "server.js"]
