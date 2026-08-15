function readPort(fallback: number): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got "${raw}"`);
  }
  return parsed;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: readPort(3000),
  logLevel: process.env.LOG_LEVEL ?? "info",
} as const;

export const isProduction = config.nodeEnv === "production";
