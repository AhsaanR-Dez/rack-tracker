import { useState } from "react";
import { ApiError } from "../api/client";
import { useCreateRack } from "../hooks/queries";
import { FormField, inputClass } from "./FormField";

function issuesByPath(error: Error | null): Record<string, string> {
  if (!(error instanceof ApiError)) return {};
  return Object.fromEntries(error.issues.map((issue) => [issue.path, issue.message]));
}

export function CreateRackForm() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [totalUnits, setTotalUnits] = useState("42");

  const createRack = useCreateRack();
  const fieldErrors = issuesByPath(createRack.error);

  function handleSubmit() {
    createRack.mutate(
      { name, location, totalUnits: Number(totalUnits) },
      {
        onSuccess: () => {
          setName("");
          setLocation("");
          setTotalUnits("42");
        },
      },
    );
  }

  const generalError =
    createRack.error instanceof ApiError && createRack.error.issues.length === 0
      ? createRack.error.message
      : null;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
      className="grid gap-3 rounded-lg border border-slate-700 bg-slate-900/60 p-4 sm:grid-cols-4"
    >
      <FormField label="Name" error={fieldErrors.name}>
        <input
          value={name}
          onChange={(event) => {
            setName(event.target.value);
          }}
          className={inputClass}
          placeholder="R2"
        />
      </FormField>

      <FormField label="Location" error={fieldErrors.location}>
        <input
          value={location}
          onChange={(event) => {
            setLocation(event.target.value);
          }}
          className={inputClass}
          placeholder="Room B"
        />
      </FormField>

      <FormField label="Total units" error={fieldErrors.totalUnits}>
        <input
          type="number"
          value={totalUnits}
          onChange={(event) => {
            setTotalUnits(event.target.value);
          }}
          className={inputClass}
        />
      </FormField>

      <div className="flex items-end">
        <button
          type="submit"
          disabled={createRack.isPending}
          className="w-full rounded bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-900 hover:bg-white disabled:opacity-50"
        >
          {createRack.isPending ? "Adding..." : "Add rack"}
        </button>
      </div>

      {generalError !== null && (
        <p className="text-sm text-rose-300 sm:col-span-4">{generalError}</p>
      )}
    </form>
  );
}
