import { z } from "zod";

export const createRackSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(2, "name must be at least 2 characters")
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/, "name can only contain letters, numbers and hyphens"),
  location: z.string().trim().min(2, "location must be at least 2 characters").max(100),
  totalUnits: z
    .number()
    .int()
    .min(6, "a rack must have at least 6 units")
    .max(60, "a rack cannot have more than 60 units"),
});

export const updateRackSchema = createRackSchema;

export const rackIdParamSchema = z.strictObject({
  id: z.coerce.number().int().positive(),
});

export type CreateRackInput = z.infer<typeof createRackSchema>;
export type UpdateRackInput = z.infer<typeof updateRackSchema>;
export type RackIdParam = z.infer<typeof rackIdParamSchema>;