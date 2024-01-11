# Use multiarch/qemu-user-static to register QEMU and enable execution of different multi-architecture containers
FROM --platform=linux/amd64 multiarch/qemu-user-static:x86_64-aarch64 as qemu

# ---- Base Node ----
FROM --platform=linux/amd64 node:21-alpine3.18 AS base
COPY --from=qemu /usr/bin/qemu-aarch64-static /usr/bin/
WORKDIR /app
COPY package*.json ./

# Update apk and install libc6-compat for glibc compatibility
RUN apk update \
    && apk add libc6-compat

RUN npm install -g npm@10.3.0
RUN npm install

# # ---- Dependencies ----
# FROM base AS dependencies
# # Temporarily ignore-scripts
# RUN npm ci

# ---- Build ----
# FROM --platform=linux/amd64 dependencies AS build
COPY . .
RUN npm run build

# ---- Production ----
FROM --platform=linux/amd64 node:21-alpine3.18 AS production

# Again, copying QEMU binary for ARM64 emulation
COPY --from=qemu /usr/bin/qemu-aarch64-static /usr/bin/

# Installing libc6-compat if necessary
RUN apk update \
    && apk add libc6-compat

WORKDIR /app
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
