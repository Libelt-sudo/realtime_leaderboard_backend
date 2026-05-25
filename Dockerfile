FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 3000

# Run migrations and start app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/app.js"]