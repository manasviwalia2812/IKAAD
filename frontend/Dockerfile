# Step 1: Build the React application
FROM node:18-alpine AS build

WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the app source code
COPY . .

# Build the Vite app
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration to support SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React app to the Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
