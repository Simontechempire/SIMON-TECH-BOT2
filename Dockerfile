FROM node:20-alpine

WORKDIR /app

# Install system dependencies required by npm packages
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install production dependencies using the modern npm flag
RUN npm install --omit=dev --no-audit --no-fund

# Copy application files
COPY . .

# Render provides PORT at runtime; keep 3000 as the local/container default.
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000), (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
