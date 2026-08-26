export const EQUIPMENT_STATUSES = ["active", "inactive", "maintenance", "decommissioned"] as const;

export type EquipmentStatus = (typeof EQUIPMENT_STATUSES)[number];

export interface Rack {
  id: number;
  name: string;
  location: string;
  totalUnits: number;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: number;
  rackId: number;
  hostname: string;
  model: string;
  status: EquipmentStatus;
  startUnit: number;
  unitHeight: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRackInput {
  name: string;
  location: string;
  totalUnits: number;
}

export interface CreateEquipmentInput {
  rackId: number;
  hostname: string;
  model: string;
  status?: EquipmentStatus;
  startUnit: number;
  unitHeight?: number;
}
