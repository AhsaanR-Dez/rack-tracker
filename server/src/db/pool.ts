import { Pool } from "pg";
import { config } from "../config.js";
import { logger } from "../logger.js";

export const pool = new Pool({ connectionString: config.databaseUrl });

pool.on("error", (err) => {
  logger.error({ err }, "unexpected error on idle database client");
});

export async function closePool(): Promise<void> {
  await pool.end();
}
