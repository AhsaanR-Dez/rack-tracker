import type { ColumnDefinitions, MigrationBuilder } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export function up(pgm: MigrationBuilder): void {
  pgm.createTable("racks", {
    id: "id",
    name: { type: "text", notNull: true, unique: true },
    location: { type: "text", notNull: true },
    total_units: { type: "integer", notNull: true },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.addConstraint("racks", "racks_total_units_positive", {
    check: "total_units > 0",
  });

  pgm.createTable("equipment", {
    id: "id",
    rack_id: {
      type: "integer",
      notNull: true,
      references: "racks",
      onDelete: "CASCADE",
    },
    hostname: { type: "text", notNull: true, unique: true },
    model: { type: "text", notNull: true },
    status: { type: "text", notNull: true, default: "active" },
    start_unit: { type: "integer", notNull: true },
    unit_height: { type: "integer", notNull: true, default: 1 },
    created_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
    updated_at: { type: "timestamptz", notNull: true, default: pgm.func("now()") },
  });

  pgm.addConstraint("equipment", "equipment_status_allowed", {
    check: "status IN ('active', 'inactive', 'maintenance', 'decommissioned')",
  });

  pgm.addConstraint("equipment", "equipment_start_unit_positive", {
    check: "start_unit > 0",
  });

  pgm.addConstraint("equipment", "equipment_unit_height_positive", {
    check: "unit_height > 0",
  });

  pgm.addConstraint("equipment", "equipment_rack_id_start_unit_unique", {
    unique: ["rack_id", "start_unit"],
  });

  pgm.createIndex("equipment", "rack_id");
  pgm.createIndex("equipment", "status");
}

export function down(pgm: MigrationBuilder): void {
  pgm.dropTable("equipment");
  pgm.dropTable("racks");
}
