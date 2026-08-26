import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildApp } from "./app.js";
import { ConflictError, NotFoundError } from "./errors/http-errors.js";
import type { Equipment, Rack } from "./types.js";

interface ApiResponse<T> {
  data?: T;
  error?: { status: number; message: string; issues?: { path: string; message: string }[] };
}

function body<T>(res: { body: unknown }): ApiResponse<T> {
  return res.body as ApiResponse<T>;
}

vi.mock("./repositories/rack-repository.js", () => ({
  findAllRacks: vi.fn(),
  findRackById: vi.fn(),
  createRack: vi.fn(),
  updateRack: vi.fn(),
  deleteRack: vi.fn(),
}));

vi.mock("./repositories/equipment-repository.js", () => ({
  findAllEquipment: vi.fn(),
  findEquipmentById: vi.fn(),
  createEquipment: vi.fn(),
  updateEquipment: vi.fn(),
  deleteEquipment: vi.fn(),
}));

const { findAllRacks, findRackById, createRack, updateRack, deleteRack } =
  await import("./repositories/rack-repository.js");
const { findAllEquipment, findEquipmentById, createEquipment, updateEquipment, deleteEquipment } =
  await import("./repositories/equipment-repository.js");

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

const validRackBody = { name: "R1", location: "Room A", totalUnits: 42 };
const validEquipmentBody = {
  rackId: 1,
  hostname: "sw-a-01",
  model: "Cisco C9300",
  startUnit: 1,
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

    expect(res.status).toBe(200);
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

describe("GET /api/racks/:id", () => {
  it("returns the rack when it exists", async () => {
    vi.mocked(findRackById).mockResolvedValue(sampleRack);

    const res = await request(app).get("/api/racks/1");

    expect(res.status).toBe(200);
    expect(body<Rack>(res).data).toMatchObject({ id: 1 });
    expect(findRackById).toHaveBeenCalledWith(1);
  });

  it("returns 404 when the rack does not exist", async () => {
    vi.mocked(findRackById).mockResolvedValue(null);

    const res = await request(app).get("/api/racks/999");

    expect(res.status).toBe(404);
    expect(body(res).error?.status).toBe(404);
  });

  it("returns 400 for a non-numeric id without hitting the repository", async () => {
    const res = await request(app).get("/api/racks/abc");

    expect(res.status).toBe(400);
    expect(findRackById).not.toHaveBeenCalled();
  });
});

describe("POST /api/racks", () => {
  it("returns 201 with a Location header", async () => {
    vi.mocked(createRack).mockResolvedValue(sampleRack);

    const res = await request(app).post("/api/racks").send(validRackBody);

    expect(res.status).toBe(201);
    expect(res.headers.location).toBe("/api/racks/1");
    expect(body<Rack>(res).data).toMatchObject({ id: 1, name: "R1" });
  });

  it("returns 400 listing every missing field at once", async () => {
    const res = await request(app).post("/api/racks").send({});

    expect(res.status).toBe(400);
    expect(body(res).error?.issues).toHaveLength(3);
    expect(createRack).not.toHaveBeenCalled();
  });

  it("returns 400 for an unrecognized key", async () => {
    const res = await request(app)
      .post("/api/racks")
      .send({ ...validRackBody, nmae: "typo" });

    expect(res.status).toBe(400);
    expect(body(res).error?.issues?.[0]?.message).toContain("nmae");
  });

  it("returns 400 when totalUnits is a string", async () => {
    const res = await request(app)
      .post("/api/racks")
      .send({ ...validRackBody, totalUnits: "42" });

    expect(res.status).toBe(400);
    expect(body(res).error?.issues?.[0]?.path).toBe("totalUnits");
  });

  it("returns 409 when the name is taken", async () => {
    vi.mocked(createRack).mockRejectedValue(new ConflictError('A rack named "R1" already exists'));

    const res = await request(app).post("/api/racks").send(validRackBody);

    expect(res.status).toBe(409);
    expect(body(res).error?.status).toBe(409);
  });
});

describe("PUT /api/racks/:id", () => {
  it("passes the coerced numeric id to the repository", async () => {
    vi.mocked(updateRack).mockResolvedValue(sampleRack);

    const res = await request(app).put("/api/racks/1").send(validRackBody);

    expect(res.status).toBe(200);
    expect(updateRack).toHaveBeenCalledWith(1, validRackBody);
  });

  it("returns 404 when the rack does not exist", async () => {
    vi.mocked(updateRack).mockRejectedValue(new NotFoundError("Rack 999 was not found"));

    const res = await request(app).put("/api/racks/999").send(validRackBody);

    expect(res.status).toBe(404);
  });

  it("returns 400 for an invalid body without hitting the repository", async () => {
    const res = await request(app).put("/api/racks/1").send({ name: "" });

    expect(res.status).toBe(400);
    expect(updateRack).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/racks/:id", () => {
  it("returns 204 with no body when the rack is empty", async () => {
    vi.mocked(deleteRack).mockResolvedValue(undefined);

    const res = await request(app).delete("/api/racks/1");

    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect(deleteRack).toHaveBeenCalledWith(1);
  });

  it("returns 409 when the rack still holds equipment", async () => {
    vi.mocked(deleteRack).mockRejectedValue(
      new ConflictError("Rack 1 still holds 1 item(s). Remove them first."),
    );

    const res = await request(app).delete("/api/racks/1");

    expect(res.status).toBe(409);
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
describe("GET /api/equipment/:id", () => {
  it("returns the item when it exists", async () => {
    vi.mocked(findEquipmentById).mockResolvedValue(sampleEquipment);

    const res = await request(app).get("/api/equipment/1");

    expect(res.status).toBe(200);
    expect(body<Equipment>(res).data).toMatchObject({ hostname: "sw-a-01" });
    expect(findEquipmentById).toHaveBeenCalledWith(1);
  });

  it("returns 404 when it does not exist", async () => {
    vi.mocked(findEquipmentById).mockResolvedValue(null);

    const res = await request(app).get("/api/equipment/999");

    expect(res.status).toBe(404);
  });
});

describe("POST /api/equipment", () => {
  it("returns 201 and applies the schema defaults", async () => {
    vi.mocked(createEquipment).mockResolvedValue(sampleEquipment);

    const res = await request(app).post("/api/equipment").send(validEquipmentBody);

    expect(res.status).toBe(201);
    expect(res.headers.location).toBe("/api/equipment/1");
    expect(createEquipment).toHaveBeenCalledWith({
      ...validEquipmentBody,
      status: "active",
      unitHeight: 1,
    });
  });

  it("returns 409 when the slot is already occupied", async () => {
    vi.mocked(createEquipment).mockRejectedValue(
      new ConflictError("srv-a-01 already occupies units 10 to 13"),
    );

    const res = await request(app)
      .post("/api/equipment")
      .send({ ...validEquipmentBody, startUnit: 12 });

    expect(res.status).toBe(409);
    expect(body(res).error?.message).toContain("occupies");
  });

  it("returns 409 when the item does not fit in the rack", async () => {
    vi.mocked(createEquipment).mockRejectedValue(
      new ConflictError("Units 40 to 43 do not fit in a 42U rack"),
    );

    const res = await request(app)
      .post("/api/equipment")
      .send({ ...validEquipmentBody, startUnit: 40, unitHeight: 4 });

    expect(res.status).toBe(409);
  });

  it("returns 404 when the rack does not exist", async () => {
    vi.mocked(createEquipment).mockRejectedValue(new NotFoundError("Rack 999 was not found"));

    const res = await request(app)
      .post("/api/equipment")
      .send({ ...validEquipmentBody, rackId: 999 });

    expect(res.status).toBe(404);
  });

  it("returns 400 for a status outside the allowed set", async () => {
    const res = await request(app)
      .post("/api/equipment")
      .send({ ...validEquipmentBody, status: "broken" });

    expect(res.status).toBe(400);
    expect(body(res).error?.issues?.[0]?.path).toBe("status");
    expect(createEquipment).not.toHaveBeenCalled();
  });

  it("returns 400 for a hostname over 15 characters", async () => {
    const res = await request(app)
      .post("/api/equipment")
      .send({ ...validEquipmentBody, hostname: "this-name-is-way-too-long" });

    expect(res.status).toBe(400);
    expect(body(res).error?.issues?.[0]?.path).toBe("hostname");
  });
});

describe("PUT /api/equipment/:id", () => {
  it("allows an item to keep its own slot", async () => {
    vi.mocked(updateEquipment).mockResolvedValue(sampleEquipment);

    const res = await request(app).put("/api/equipment/1").send(validEquipmentBody);

    expect(res.status).toBe(200);
    expect(updateEquipment).toHaveBeenCalledWith(1, {
      ...validEquipmentBody,
      status: "active",
      unitHeight: 1,
    });
  });

  it("returns 404 when the item does not exist", async () => {
    vi.mocked(updateEquipment).mockRejectedValue(new NotFoundError("Equipment 999 was not found"));

    const res = await request(app).put("/api/equipment/999").send(validEquipmentBody);

    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/equipment/:id", () => {
  it("returns 204 with no body", async () => {
    vi.mocked(deleteEquipment).mockResolvedValue(undefined);

    const res = await request(app).delete("/api/equipment/1");

    expect(res.status).toBe(204);
    expect(res.text).toBe("");
    expect(deleteEquipment).toHaveBeenCalledWith(1);
  });

  it("returns 404 when the item does not exist", async () => {
    vi.mocked(deleteEquipment).mockRejectedValue(new NotFoundError("Equipment 999 was not found"));

    const res = await request(app).delete("/api/equipment/999");

    expect(res.status).toBe(404);
  });
});
