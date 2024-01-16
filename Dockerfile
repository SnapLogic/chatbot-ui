# ---- Base Node ----
FROM node:21 AS base
WORKDIR /app
COPY package*.json ./

# Define build arguments for environment variables
ARG NEXT_PUBLIC_API_ENDPOINT
ARG NEXT_PUBLIC_BEARER_TOKEN

# Set build arguments as environment variables
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT
ENV NEXT_PUBLIC_BEARER_TOKEN=$NEXT_PUBLIC_BEARER_TOKEN

# ---- Dependencies ----
FROM base AS dependencies
RUN npm ci

# ---- Build ----
FROM dependencies AS build
# Copy over the environment variables to the build stage
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT
ENV NEXT_PUBLIC_BEARER_TOKEN=$NEXT_PUBLIC_BEARER_TOKEN

COPY . .
RUN npm run build

# ---- Production ----
FROM node:21 AS production
WORKDIR /app

# Copy the build environment variables to the production stage
ENV NEXT_PUBLIC_API_ENDPOINT=$NEXT_PUBLIC_API_ENDPOINT
ENV NEXT_PUBLIC_BEARER_TOKEN=$NEXT_PUBLIC_BEARER_TOKEN

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package*.json ./
COPY --from=build /app/next.config.js ./next.config.js
COPY --from=build /app/next-i18next.config.js ./next-i18next.config.js

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
