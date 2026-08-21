import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "./app.js";
import type { Equipment, Rack } from "./types.js";

interface ApiResponse<T> {
  data?: T;
  error?: { status: number; message: string };
}

function body<T>(res: { body: unknown }): ApiResponse<T> {
  return res.body as ApiResponse<T>;
}

vi.mock("./repositories/rack-repository.js", () => ({
  findAllRacks: vi.fn(),
}));

vi.mock("./repositories/equipment-repository.js", () => ({
  findAllEquipment: vi.fn(),
}));

const { findAllRacks } = await import("./repositories/rack-repository.js");
const { findAllEquipment } = await import("./repositories/equipment-repository.js");

const sampleRack: Rack = {
  id: 1,
  name: "R1",
  location: "Room A",
  totalUnits: 42,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const sampleEquipment: Equipment = {
  id: 1,
  rackId: 1,
  hostname: "sw-a-01",
  model: "Cisco C9300",
  status: "active",
  startUnit: 1,
  unitHeight: 1,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const app = buildApp();

beforeEach(() => {
  vi.resetAllMocks();
});

describe("GET /healthz", () => {
  it("returns 200 without touching the database", async () => {
    const res = await request(app).get("/healthz");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: "ok" });
    expect(findAllRacks).not.toHaveBeenCalled();
  });
});

describe("GET /api/racks", () => {
  it("returns the racks wrapped in data", async () => {
    vi.mocked(findAllRacks).mockResolvedValue([sampleRack]);

    const res = await request(app).get("/api/racks");

    expect(body<Rack[]>(res).data).toHaveLength(1);
    expect(body<Rack[]>(res).data?.[0]).toMatchObject({ name: "R1", totalUnits: 42 });
  });

  it("returns an empty array when there are no racks", async () => {
    vi.mocked(findAllRacks).mockResolvedValue([]);

    const res = await request(app).get("/api/racks");

    expect(res.status).toBe(200);
    expect(body<Rack[]>(res).data).toEqual([]);
  });

  it("returns 500 through the error handler when the query fails", async () => {
    vi.mocked(findAllRacks).mockRejectedValue(new Error("connection refused"));

    const res = await request(app).get("/api/racks");

    expect(res.status).toBe(500);
    expect(body(res).error?.status).toBe(500);
  });
});

describe("GET /api/equipment", () => {
  it("returns the equipment wrapped in data", async () => {
    vi.mocked(findAllEquipment).mockResolvedValue([sampleEquipment]);

    const res = await request(app).get("/api/equipment");

    expect(res.status).toBe(200);
    expect(body<Equipment[]>(res).data?.[0]).toMatchObject({ hostname: "sw-a-01", rackId: 1 });
  });
});

describe("unknown routes", () => {
  it("returns 404 in the standard error shape", async () => {
    const res = await request(app).get("/does-not-exist");

    expect(res.status).toBe(404);
    expect(body(res).error?.status).toBe(404);
  });
});
