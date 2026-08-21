import type { ErrorRequestHandler } from "express";
import { isProduction } from "../config.js";
import { ValidationError } from "../errors/validation-error.js";
import { logger } from "../logger.js";

interface HttpError extends Error {
  status?: number;
}

function normalize(err: unknown): HttpError {
  if (err instanceof Error) return err;
  return new Error(typeof err === "string" ? err : "Unknown error");
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const error = normalize(err);
  const status = error.status ?? 500;

  if (status >= 500) {
    logger.error(
      { err: error, method: req.method, url: req.originalUrl, status },
      "request failed",
    );
  } else {
    logger.warn({ method: req.method, url: req.originalUrl, status }, "request rejected");
  }

  res.status(status).json({
    error: {
      status,
      message: status >= 500 && isProduction ? "Internal Server Error" : error.message,
      ...(error instanceof ValidationError ? { issues: error.issues } : {}),
    },
  });
};
