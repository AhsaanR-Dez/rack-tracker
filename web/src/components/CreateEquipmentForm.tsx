import { useState } from "react";
import { ApiError } from "../api/client";
import { useCreateEquipment } from "../hooks/queries";
import { EQUIPMENT_STATUSES, type EquipmentStatus, type Rack } from "../types";
import { FormField, inputClass } from "./FormField";

function issuesByPath(error: Error | null): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(error.issues.map((issue) => [issue.path, issue.message]));
}

interface CreateEquipmentFormProps {
  racks: Rack[];
}

export function CreateEquipmentForm({ racks }: CreateEquipmentFormProps) {
  const [rackId, setRackId] = useState("");
  const [hostname, setHostname] = useState("");
  const [model, setModel] = useState("");
  const [status, setStatus] = useState<EquipmentStatus>("active");
  const [startUnit, setStartUnit] = useState("1");
  const [unitHeight, setUnitHeight] = useState("1");

  const createEquipment = useCreateEquipment();
  const fieldErrors = issuesByPath(createEquipment.error);

  const generalError =
    createEquipment.error instanceof ApiError && createEquipment.error.issues.length === 0
      ? createEquipment.error.message
      : null;

  function handleSubmit() {
    createEquipment.mutate(
      {
        rackId: Number(rackId),
        hostname,
        model,
        status,
        startUnit: Number(startUnit),
        unitHeight: Number(unitHeight),
      },
      {
        onSuccess: () => {
          setHostname("");
          setModel("");
          setStartUnit("1");
          setUnitHeight("1");
        },
      },
    );
  }

  if (racks.length === 0) {
    return (
      <p className="rounded-lg border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-400">
        Add a rack before adding equipment.
      </p>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      className="grid gap-3 rounded-lg border border-slate-700 bg-slate-900/60 p-4 sm:grid-cols-3 lg:grid-cols-7"
    >
      <FormField label="Rack" error={fieldErrors.rackId}>
        <select
          value={rackId}
          onChange={(event) => {
            setRackId(event.target.value);
          }}
          className={inputClass}
        >
          <option value="">Select...</option>
          {racks.map((rack) => (
            <option key={rack.id} value={rack.id}>
              {rack.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Hostname" error={fieldErrors.hostname}>
        <input
          value={hostname}
          onChange={(event) => {
            setHostname(event.target.value);
          }}
          className={inputClass}
          placeholder="sw-b-01"
        />
      </FormField>

      <FormField label="Model" error={fieldErrors.model}>
        <input
          value={model}
          onChange={(event) => {
            setModel(event.target.value);
          }}
          className={inputClass}
          placeholder="Cisco C9300"
        />
      </FormField>

      <FormField label="Status" error={fieldErrors.status}>
        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as EquipmentStatus);
          }}
          className={inputClass}
        >
          {EQUIPMENT_STATUSES.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="Start unit" error={fieldErrors.startUnit}>
        <input
          type="number"
          value={startUnit}
          onChange={(event) => {
            setStartUnit(event.target.value);
          }}
          className={inputClass}
        />
      </FormField>

      <FormField label="Height (U)" error={fieldErrors.unitHeight}>
        <input
          type="number"
          value={unitHeight}
          onChange={(event) => {
            setUnitHeight(event.target.value);
          }}
          className={inputClass}
        />
      </FormField>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={createEquipment.isPending}
          className="w-full rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-white disabled:opacity-50"
        >
          {createEquipment.isPending ? "Adding..." : "Add"}
        </button>
      </div>

      {generalError !== null && (
        <p className="text-sm text-rose-300 sm:col-span-3 lg:col-span-7">{generalError}</p>
      )}
    </form>
  );
}
