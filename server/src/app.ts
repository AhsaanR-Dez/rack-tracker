import express, { type Express } from "express";
import { pinoHttp } from "pino-http";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound } from "./middleware/not-found.js";
import { logger } from "./logger.js";
import { healthzRouter } from "./routes/healthz.js";

export function buildApp(): Express {
  const app = express();

  app.disable("x-powered-by");

  app.use(pinoHttp({ logger }));
  app.use(express.json());

  app.use("/healthz", healthzRouter);

  app.use("/*splat", notFound);
  app.use(errorHandler);

  return app;
}
