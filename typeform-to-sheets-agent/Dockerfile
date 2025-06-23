# Use Node.js LTS
FROM node:18-alpine

# Create app directory and set working directory
WORKDIR /usr/src/app

# Install system dependencies
RUN apk --no-cache add curl

# Set environment variables
ENV NODE_ENV=production

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy app source
COPY . .


# Expose the app port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Run as non-root user for security
RUN chown -R node:node /usr/src/app
USER node

# Start the application
CMD ["node", "src/index.js"]
