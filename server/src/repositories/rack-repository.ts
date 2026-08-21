import { pool } from "../db/pool.js";
import { ConflictError, NotFoundError } from "../errors/http-errors.js";
import type { CreateRackInput, UpdateRackInput } from "../schemas/rack.schemas.js";
import type { Rack } from "../types.js";

const RACK_COLUMNS = "id, name, location, total_units, created_at, updated_at";

const UNIQUE_VIOLATION = "23505";

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

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && "code" in err && err.code === UNIQUE_VIOLATION;
}

export async function findAllRacks(): Promise<Rack[]> {
  const result = await pool.query<RackRow>(
    `SELECT ${RACK_COLUMNS}
       FROM racks
   ORDER BY name`,
  );

  return result.rows.map(toRack);
}

export async function findRackById(id: number): Promise<Rack | null> {
  const result = await pool.query<RackRow>(
    `SELECT ${RACK_COLUMNS}
       FROM racks
      WHERE id = $1`,
    [id],
  );

  const row = result.rows[0];
  return row === undefined ? null : toRack(row);
}

export async function createRack(input: CreateRackInput): Promise<Rack> {
  try {
    const result = await pool.query<RackRow>(
      `INSERT INTO racks (name, location, total_units)
            VALUES ($1, $2, $3)
         RETURNING ${RACK_COLUMNS}`,
      [input.name, input.location, input.totalUnits],
    );

    const row = result.rows[0];
    if (row === undefined) {
      throw new Error("INSERT returned no row");
    }

    return toRack(row);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError(`A rack named "${input.name}" already exists`);
    }
    throw err;
  }
}

export async function updateRack(id: number, input: UpdateRackInput): Promise<Rack> {
  try {
    const result = await pool.query<RackRow>(
      `UPDATE racks
          SET name = $1, location = $2, total_units = $3, updated_at = now()
        WHERE id = $4
    RETURNING ${RACK_COLUMNS}`,
      [input.name, input.location, input.totalUnits, id],
    );

    const row = result.rows[0];
    if (row === undefined) {
      throw new NotFoundError(`Rack ${String(id)} was not found`);
    }

    return toRack(row);
  } catch (err) {
    if (isUniqueViolation(err)) {
      throw new ConflictError(`A rack named "${input.name}" already exists`);
    }
    throw err;
  }
}
