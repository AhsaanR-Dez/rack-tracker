import { pool } from "../db/pool.js";
import type { Equipment, EquipmentStatus } from "../types.js";

interface EquipmentRow {
  id: number;
  rack_id: number;
  hostname: string;
  model: string;
  status: EquipmentStatus;
  start_unit: number;
  unit_height: number;
  created_at: Date;
  updated_at: Date;
}

function toEquipment(row: EquipmentRow): Equipment {
  return {
    id: row.id,
    rackId: row.rack_id,
    hostname: row.hostname,
    model: row.model,
    status: row.status,
    startUnit: row.start_unit,
    unitHeight: row.unit_height,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findAllEquipment(): Promise<Equipment[]> {
  const result = await pool.query<EquipmentRow>(
    `SELECT id, rack_id, hostname, model, status, start_unit, unit_height,
            created_at, updated_at
       FROM equipment
   ORDER BY rack_id, start_unit`,
  );

  return result.rows.map(toEquipment);
}
