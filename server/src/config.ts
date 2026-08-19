function readPort(fallback: number): number {
  const raw = process.env.PORT;
  if (raw === undefined || raw === "") return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65535) {
    throw new Error(`PORT must be an integer between 1 and 65535, got "${raw}"`);
  }
  return parsed;
}

function required(name: string, value: string | undefined): string {
  if (value === undefined || value === "") {
    throw new Error(`${name} is required but was not set`);
  }
  return value;
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: readPort(3000),
  logLevel: process.env.LOG_LEVEL ?? "info",
  databaseUrl: required("DATABASE_URL", process.env.DATABASE_URL),
} as const;

export const isProduction = config.nodeEnv === "production";
