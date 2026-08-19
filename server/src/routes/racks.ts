import { Router } from "express";
import { findAllRacks } from "../repositories/rack-repository.js";

export const racksRouter = Router();

racksRouter.get("/", async (_req, res) => {
  const racks = await findAllRacks();
  res.json({ data: racks });
});
