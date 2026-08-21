import { z } from "zod";

export const createRackSchema = z.strictObject({
  name: z.string().trim().min(1, "name is required").max(100),
  location: z.string().trim().min(1, "location is required").max(200),
  totalUnits: z.number().int().positive().max(100),
});

export const updateRackSchema = createRackSchema;

export const rackIdParamSchema = z.strictObject({
  id: z.coerce.number().int().positive(),
});

export type CreateRackInput = z.infer<typeof createRackSchema>;
export type UpdateRackInput = z.infer<typeof updateRackSchema>;
export type RackIdParam = z.infer<typeof rackIdParamSchema>;
