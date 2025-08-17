FROM oven/bun:latest

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY bun.lock package.json ./
COPY prisma ./prisma

RUN bun install

COPY . .

RUN bunx prisma generate

# Expose the port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health-check || exit 1

CMD ["bun", "run", "start"]