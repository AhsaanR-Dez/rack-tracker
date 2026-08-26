import { apiRequest } from "./client";
import type { CreateEquipmentInput, Equipment } from "../types";

export function fetchEquipment(): Promise<Equipment[]> {
  return apiRequest<Equipment[]>("/api/equipment");
}

export function createEquipment(input: CreateEquipmentInput): Promise<Equipment> {
  return apiRequest<Equipment>("/api/equipment", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateEquipment(id: number, input: CreateEquipmentInput): Promise<Equipment> {
  return apiRequest<Equipment>(`/api/equipment/${String(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteEquipment(id: number): Promise<void> {
  await apiRequest<undefined>(`/api/equipment/${String(id)}`, { method: "DELETE" });
}
