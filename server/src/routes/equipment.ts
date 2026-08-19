import { Router } from "express";
import { findAllEquipment } from "../repositories/equipment-repository.js";

export const equipmentRouter = Router();

equipmentRouter.get("/", async (_req, res) => {
  const equipment = await findAllEquipment();
  res.json({ data: equipment });
});
