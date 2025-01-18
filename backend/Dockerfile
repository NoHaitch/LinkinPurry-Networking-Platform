# Stage 1: Build the application
FROM node:20-alpine AS build

# Set the working directory
WORKDIR /home/node/app

# Create and set permissions for the working directory
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

# Switch to a non-root user
USER node

# Copy package.json and package-lock.json to install dependencies
COPY --chown=node:node package*.json ./

# Install dependencies including devDependencies
RUN npm ci

# Copy the rest of the application source code
COPY --chown=node:node . .

# Copy .env.example to ./.env
COPY .env.example ./.env

# Generate Prisma Client
RUN npx prisma generate

# Compile TypeScript to JavaScript
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

# Set the working directory
WORKDIR /home/node/app

# Create and set permissions for the working directory
RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

# Switch to a non-root user
USER node

# Copy only production dependencies
COPY --from=build /home/node/app/package*.json ./
RUN npm ci --only=production

# Copy the compiled application from the build stage
COPY --from=build /home/node/app/dist ./dist

# Copy Prisma Client and schema
COPY --from=build /home/node/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /home/node/app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /home/node/app/prisma ./prisma

# Copy the env file from build
COPY --from=build /home/node/app/.env ./.env

# Expose the backend port
ENV PORT=3000
EXPOSE 3000

# Run the application and migrate the db
CMD ["sh", "-c", "npx prisma db pull && node dist/index.js"]
