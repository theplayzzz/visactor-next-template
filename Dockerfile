FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/scripts/sync-meta-ads.mjs ./scripts/sync-meta-ads.mjs
COPY --from=builder /app/scripts/audit-meta-ads.mjs ./scripts/audit-meta-ads.mjs
COPY --from=builder /app/scripts/audit-kommo-sync.mjs ./scripts/audit-kommo-sync.mjs
COPY --from=builder /app/scripts/run-kommo-cron.mjs ./scripts/run-kommo-cron.mjs
USER node
EXPOSE 3000
CMD ["node", "server.js"]
