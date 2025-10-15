FROM node:lts-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm install --prod
COPY . .
EXPOSE 5000
CMD ["pnpm", "start"]

