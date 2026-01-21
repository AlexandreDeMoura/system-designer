FROM node:20-slim AS builder

WORKDIR /app

# Copy package files for all workspaces
COPY package*.json ./
COPY packages/api/package.json ./packages/api/
COPY apps/server/package.json ./apps/server/

# Install all dependencies
RUN npm ci

# Copy source code
COPY packages/api ./packages/api
COPY apps/server ./apps/server
COPY tsconfig.json ./

# Build api first, then server
RUN npm -w @sd/api run build
RUN npm -w @sd/server run build

# Production stage
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
COPY packages/api/package.json ./packages/api/
COPY apps/server/package.json ./apps/server/

RUN npm ci --omit=dev

# Copy built artifacts
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/apps/server/dist ./apps/server/dist

EXPOSE 8080

CMD ["node", "apps/server/dist/index.js"]

