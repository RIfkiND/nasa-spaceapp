FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
# Copy the built Vite output (dist) to Nginx's public dir
COPY --from=builder /app/dist /usr/share/nginx/html
# Provide a simple nginx conf for SPA routing if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]