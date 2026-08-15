import { Router } from "express";

export const healthzRouter = Router();

healthzRouter.get("/", (_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: Math.round(process.uptime()),
  });
});
