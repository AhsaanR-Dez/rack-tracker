import { apiRequest } from "./client";
import type { CreateRackInput, Rack } from "../types";

export function fetchRacks(): Promise<Rack[]> {
  return apiRequest<Rack[]>("/api/racks");
}

export function fetchRack(id: number): Promise<Rack> {
  return apiRequest<Rack>(`/api/racks/${String(id)}`);
}

export function createRack(input: CreateRackInput): Promise<Rack> {
  return apiRequest<Rack>("/api/racks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateRack(id: number, input: CreateRackInput): Promise<Rack> {
  return apiRequest<Rack>(`/api/racks/${String(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteRack(id: number): Promise<void> {
  await apiRequest<undefined>(`/api/racks/${String(id)}`, { method: "DELETE" });
}
