import express, { type Express } from "express";
import { pinoHttp } from "pino-http";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { logger } from "./logger.js";
import { healthzRouter } from "./routes/healthz.js";
import { equipmentRouter } from "./routes/equipment.js";
import { racksRouter } from "./routes/racks.js";

export function buildApp(): Express {
  const app = express();

  app.disable("x-powered-by");

  app.use(pinoHttp({ logger }));
  app.use(express.json());

  app.use("/healthz", healthzRouter);
  app.use("/api/racks", racksRouter);
  app.use("/api/equipment", equipmentRouter);

  app.use("/*splat", notFound);
  app.use(errorHandler);

  return app;
}
