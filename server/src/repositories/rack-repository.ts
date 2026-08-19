import { pool } from "../db/pool.js";
import type { Rack } from "../types.js";

interface RackRow {
  id: number;
  name: string;
  location: string;
  total_units: number;
  created_at: Date;
  updated_at: Date;
}

function toRack(row: RackRow): Rack {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    totalUnits: row.total_units,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function findAllRacks(): Promise<Rack[]> {
  const result = await pool.query<RackRow>(
    `SELECT id, name, location, total_units, created_at, updated_at
       FROM racks
   ORDER BY name`,
  );

  return result.rows.map(toRack);
}
