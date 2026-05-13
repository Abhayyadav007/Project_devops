# ──────────────────────────────────────────────────────────────
# Base stage – shared by every app
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# ──────────────────────────────────────────────────────────────
# Dependency stage – install all workspace deps once
# ──────────────────────────────────────────────────────────────
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/ ./packages/
COPY apps/http-backend/package.json     ./apps/http-backend/
COPY apps/wsbackend/package.json        ./apps/wsbackend/
COPY apps/dashboard-frontend/package.json ./apps/dashboard-frontend/
COPY apps/Authdashboard/package.json    ./apps/Authdashboard/
RUN pnpm install --frozen-lockfile

# ──────────────────────────────────────────────────────────────
# HTTP Backend
# ──────────────────────────────────────────────────────────────
FROM deps AS http-backend-builder
COPY apps/http-backend/ ./apps/http-backend/
COPY packages/ ./packages/
RUN pnpm --filter http-backend build

FROM node:20-alpine AS http-backend
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY --from=http-backend-builder /app/ ./
EXPOSE 3002
CMD ["node", "apps/http-backend/dist/index.js"]

# ──────────────────────────────────────────────────────────────
# WebSocket Backend
# ──────────────────────────────────────────────────────────────
FROM deps AS wsbackend-builder
COPY apps/wsbackend/ ./apps/wsbackend/
COPY packages/ ./packages/
RUN pnpm --filter wsbackend build

FROM node:20-alpine AS wsbackend
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
COPY --from=wsbackend-builder /app/ ./
EXPOSE 3003
CMD ["node", "apps/wsbackend/dist/index.js"]

# ──────────────────────────────────────────────────────────────
# Dashboard Frontend
# ──────────────────────────────────────────────────────────────
FROM deps AS dashboard-builder
# NEXT_PUBLIC vars must be present at build time (they get inlined)
ARG NEXT_PUBLIC_API_URL=http://localhost:3002
ARG NEXT_PUBLIC_WS_URL=ws://localhost:3003
ARG NEXT_PUBLIC_AUTH_URL=http://localhost:3007
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_AUTH_URL=$NEXT_PUBLIC_AUTH_URL
COPY apps/dashboard-frontend/ ./apps/dashboard-frontend/
COPY packages/ ./packages/
RUN pnpm --filter @repo/dashboard-frontend build

FROM node:20-alpine AS dashboard-frontend
WORKDIR /app
COPY --from=dashboard-builder /app/apps/dashboard-frontend/.next/standalone ./
COPY --from=dashboard-builder /app/apps/dashboard-frontend/.next/static ./apps/dashboard-frontend/.next/static
COPY --from=dashboard-builder /app/apps/dashboard-frontend/public ./apps/dashboard-frontend/public
EXPOSE 3006
ENV PORT=3006
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/dashboard-frontend/server.js"]

# ──────────────────────────────────────────────────────────────
# Auth Dashboard
# ──────────────────────────────────────────────────────────────
FROM deps AS auth-builder
ARG NEXT_PUBLIC_API_URL=http://localhost:3002
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY apps/Authdashboard/ ./apps/Authdashboard/
COPY packages/ ./packages/
RUN pnpm --filter @repo/authdashboard build

FROM node:20-alpine AS authdashboard
WORKDIR /app
COPY --from=auth-builder /app/apps/Authdashboard/.next/standalone ./
COPY --from=auth-builder /app/apps/Authdashboard/.next/static ./apps/Authdashboard/.next/static
# Create public dir first (it may be empty), then copy contents
RUN mkdir -p ./apps/Authdashboard/public
COPY --from=auth-builder /app/apps/Authdashboard/public/. ./apps/Authdashboard/public/
EXPOSE 3007
ENV PORT=3007
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/Authdashboard/server.js"]
