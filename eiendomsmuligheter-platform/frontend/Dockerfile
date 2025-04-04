# Build stage
FROM node:18-alpine AS deps
WORKDIR /app
# Installer dependencies
COPY package*.json ./
RUN npm ci

# For byggesteg
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# For utviklingsmiljø
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Kommenterer ut produksjonsdelen siden vi bare kjører i utviklingsmodus for nå
# Production stage
# FROM nginx:alpine
# Remove default nginx configuration
# RUN rm /etc/nginx/conf.d/default.conf
# Copy optimized nginx configuration
# COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets from builder stage
# COPY --from=builder /app/build /usr/share/nginx/html
# Expose port
# EXPOSE 80
# Start nginx
# CMD ["nginx", "-g", "daemon off;"]