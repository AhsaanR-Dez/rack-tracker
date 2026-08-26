import { z } from "zod";
import { EQUIPMENT_STATUSES } from "../types.js";

export const createEquipmentSchema = z.strictObject({
  rackId: z.number().int().positive(),
  hostname: z
    .string()
    .trim()
    .min(1, "hostname is required")
    .max(15, "hostname must be 15 characters or fewer"),
  model: z.string().trim().min(1, "model is required").max(100),
  status: z.enum(EQUIPMENT_STATUSES).default("active"),
  startUnit: z.number().int().positive(),
  unitHeight: z.number().int().positive().max(20).default(1),
});

export const updateEquipmentSchema = createEquipmentSchema;

export const equipmentIdParamSchema = z.strictObject({
  id: z.coerce.number().int().positive(),
});

export type CreateEquipmentInput = z.infer<typeof createEquipmentSchema>;
export type UpdateEquipmentInput = z.infer<typeof updateEquipmentSchema>;
