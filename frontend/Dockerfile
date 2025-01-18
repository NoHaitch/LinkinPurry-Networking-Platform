# Stage 1: Build React application
FROM node:20-alpine AS build

# Create a directory for the application and set permissions
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

# Set the working directory
WORKDIR /home/node/app

# Switch to a non-root user
USER node

# Copy package.json and package-lock.json
COPY --chown=node:node package*.json ./

# Install dependencies
RUN npm ci

# Copy all frontend source files
COPY --chown=node:node . .

# Build the application for production
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:alpine

# Copy the built application from the build stage to Nginx's default directory
COPY --from=build /home/node/app/dist /usr/share/nginx/html

# Add custom Nginx configuration
COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Expose the frontend port
EXPOSE 5173

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
