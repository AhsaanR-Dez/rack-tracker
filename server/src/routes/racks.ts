import { Router } from "express";
import { NotFoundError } from "../errors/http-errors.js";
import {
  createRack,
  findAllRacks,
  findRackById,
  updateRack,
  deleteRack,
} from "../repositories/rack-repository.js";
import { createRackSchema, rackIdParamSchema, updateRackSchema } from "../schemas/rack.schemas.js";
import { parseOrThrow } from "../validation.js";

export const racksRouter = Router();

racksRouter.get("/", async (_req, res) => {
  const racks = await findAllRacks();
  res.json({ data: racks });
});

racksRouter.get("/:id", async (req, res) => {
  const { id } = parseOrThrow(rackIdParamSchema, req.params);
  const rack = await findRackById(id);

  if (rack === null) {
    throw new NotFoundError(`Rack ${String(id)} was not found`);
  }

  res.json({ data: rack });
});

racksRouter.post("/", async (req, res) => {
  const input = parseOrThrow(createRackSchema, req.body);
  const rack = await createRack(input);

  res
    .status(201)
    .location(`/api/racks/${String(rack.id)}`)
    .json({ data: rack });
});

racksRouter.put("/:id", async (req, res) => {
  const { id } = parseOrThrow(rackIdParamSchema, req.params);
  const input = parseOrThrow(updateRackSchema, req.body);
  const rack = await updateRack(id, input);

  res.json({ data: rack });
});
racksRouter.delete("/:id", async (req, res) => {
  const { id } = parseOrThrow(rackIdParamSchema, req.params);
  await deleteRack(id);

  res.status(204).send();
});
