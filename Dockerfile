# Shadow Tracker API v3.1 - Production Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm install typescript ts-node -g

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

# Start API server
CMD ["ts-node", "src/shadow-tracker/api-v3.ts"]
