import { Router } from "express";
import { NotFoundError } from "../errors/http-errors.js";
import {
  createEquipment,
  deleteEquipment,
  findAllEquipment,
  findEquipmentById,
  updateEquipment,
} from "../repositories/equipment-repository.js";
import {
  createEquipmentSchema,
  equipmentIdParamSchema,
  updateEquipmentSchema,
} from "../schemas/equipment.schemas.js";
import { parseOrThrow } from "../validation.js";

export const equipmentRouter = Router();

equipmentRouter.get("/", async (_req, res) => {
  const equipment = await findAllEquipment();
  res.json({ data: equipment });
});

equipmentRouter.get("/:id", async (req, res) => {
  const { id } = parseOrThrow(equipmentIdParamSchema, req.params);
  const item = await findEquipmentById(id);

  if (item === null) {
    throw new NotFoundError(`Equipment ${String(id)} was not found`);
  }

  res.json({ data: item });
});

equipmentRouter.post("/", async (req, res) => {
  const input = parseOrThrow(createEquipmentSchema, req.body);
  const item = await createEquipment(input);

  res
    .status(201)
    .location(`/api/equipment/${String(item.id)}`)
    .json({ data: item });
});

equipmentRouter.put("/:id", async (req, res) => {
  const { id } = parseOrThrow(equipmentIdParamSchema, req.params);
  const input = parseOrThrow(updateEquipmentSchema, req.body);
  const item = await updateEquipment(id, input);

  res.json({ data: item });
});

equipmentRouter.delete("/:id", async (req, res) => {
  const { id } = parseOrThrow(equipmentIdParamSchema, req.params);
  await deleteEquipment(id);

  res.status(204).send();
});
