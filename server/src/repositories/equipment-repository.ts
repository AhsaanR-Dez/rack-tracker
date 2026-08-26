import type { PoolClient } from "pg";
import { pool } from "../db/pool.js";
import { ConflictError, NotFoundError } from "../errors/http-errors.js";
import type { CreateEquipmentInput, UpdateEquipmentInput } from "../schemas/equipment.schemas.js";
import type { Equipment, EquipmentStatus } from "../types.js";

const EQUIPMENT_COLUMNS =
  "id, rack_id, hostname, model, status, start_unit, unit_height, created_at, updated_at";

const UNIQUE_VIOLATION = "23505";

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

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Error && "code" in err && err.code === UNIQUE_VIOLATION;
}

async function assertSlotIsFree(
  client: PoolClient,
  input: CreateEquipmentInput,
  excludeId: number,
): Promise<void> {
  const rack = await client.query<{ total_units: number }>(
    `SELECT total_units
       FROM racks
      WHERE id = $1
        FOR UPDATE`,
    [input.rackId],
  );

  const found = rack.rows[0];
  if (found === undefined) {
    throw new NotFoundError(`Rack ${String(input.rackId)} was not found`);
  }

  const lastUnit = input.startUnit + input.unitHeight - 1;
  if (lastUnit > found.total_units) {
    throw new ConflictError(
      `Units ${String(input.startUnit)} to ${String(lastUnit)} do not fit in a ${String(found.total_units)}U rack`,
    );
  }

  const clash = await client.query<{ hostname: string; start_unit: number; unit_height: number }>(
    `SELECT hostname, start_unit, unit_height
       FROM equipment
      WHERE rack_id = $1
        AND id <> $2
        AND start_unit < $3::int + $4::int
        AND start_unit + unit_height > $3::int
      LIMIT 1`,
    [input.rackId, excludeId, input.startUnit, input.unitHeight],
  );

  const occupied = clash.rows[0];
  if (occupied !== undefined) {
    const occupiedEnd = occupied.start_unit + occupied.unit_height - 1;
    throw new ConflictError(
      `${occupied.hostname} already occupies units ${String(occupied.start_unit)} to ${String(occupiedEnd)}`,
    );
  }
}

export async function findAllEquipment(): Promise<Equipment[]> {
  const result = await pool.query<EquipmentRow>(
    `SELECT ${EQUIPMENT_COLUMNS}
       FROM equipment
   ORDER BY rack_id, start_unit`,
  );

  return result.rows.map(toEquipment);
}

export async function findEquipmentById(id: number): Promise<Equipment | null> {
  const result = await pool.query<EquipmentRow>(
    `SELECT ${EQUIPMENT_COLUMNS}
       FROM equipment
      WHERE id = $1`,
    [id],
  );

  const row = result.rows[0];
  return row === undefined ? null : toEquipment(row);
}

export async function createEquipment(input: CreateEquipmentInput): Promise<Equipment> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await assertSlotIsFree(client, input, 0);

    const result = await client.query<EquipmentRow>(
      `INSERT INTO equipment (rack_id, hostname, model, status, start_unit, unit_height)
            VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING ${EQUIPMENT_COLUMNS}`,
      [input.rackId, input.hostname, input.model, input.status, input.startUnit, input.unitHeight],
    );

    const row = result.rows[0];
    if (row === undefined) {
      throw new Error("INSERT returned no row");
    }

    await client.query("COMMIT");
    return toEquipment(row);
  } catch (err) {
    await client.query("ROLLBACK");
    if (isUniqueViolation(err)) {
      throw new ConflictError(`Hostname "${input.hostname}" is already in use`);
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function updateEquipment(id: number, input: UpdateEquipmentInput): Promise<Equipment> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await assertSlotIsFree(client, input, id);

    const result = await client.query<EquipmentRow>(
      `UPDATE equipment
          SET rack_id = $1, hostname = $2, model = $3, status = $4,
              start_unit = $5, unit_height = $6, updated_at = now()
        WHERE id = $7
    RETURNING ${EQUIPMENT_COLUMNS}`,
      [
        input.rackId,
        input.hostname,
        input.model,
        input.status,
        input.startUnit,
        input.unitHeight,
        id,
      ],
    );

    const row = result.rows[0];
    if (row === undefined) {
      throw new NotFoundError(`Equipment ${String(id)} was not found`);
    }

    await client.query("COMMIT");
    return toEquipment(row);
  } catch (err) {
    await client.query("ROLLBACK");
    if (isUniqueViolation(err)) {
      throw new ConflictError(`Hostname "${input.hostname}" is already in use`);
    }
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteEquipment(id: number): Promise<void> {
  const result = await pool.query(`DELETE FROM equipment WHERE id = $1`, [id]);

  if (result.rowCount === 0) {
    throw new NotFoundError(`Equipment ${String(id)} was not found`);
  }
}
