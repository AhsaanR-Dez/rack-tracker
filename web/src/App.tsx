import { useDeleteRack, useEquipment, useRacks } from "./hooks/queries";
import { RackCard } from "./components/RackCard";
import type { Rack } from "./types";

export default function App() {
  const racksQuery = useRacks();
  const equipmentQuery = useEquipment();
  const deleteRack = useDeleteRack();

  const isLoading = racksQuery.isPending || equipmentQuery.isPending;
  const error = racksQuery.error ?? equipmentQuery.error;

  function handleDelete(rack: Rack) {
    if (!window.confirm(`Delete ${rack.name}? This cannot be undone.`)) {
      return;
    }
    deleteRack.mutate(rack.id);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 px-6 py-4">
        <h1 className="text-xl font-semibold">Rack Tracker</h1>
        <p className="text-sm text-slate-400">Data centre rack inventory</p>
      </header>

      <main className="px-6 py-6">
        {isLoading && <p className="text-slate-400">Loading...</p>}

        {error && (
          <p className="rounded border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-rose-200">
            Could not load data: {error.message}
          </p>
        )}

        {deleteRack.error && (
          <p className="mb-4 rounded border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-200">
            {deleteRack.error.message}
          </p>
        )}

        {racksQuery.data && equipmentQuery.data && (
          <>
            {racksQuery.data.length === 0 && <p className="text-slate-400">No racks yet.</p>}

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {racksQuery.data.map((rack) => (
                <RackCard
                  key={rack.id}
                  rack={rack}
                  equipment={equipmentQuery.data.filter((item) => item.rackId === rack.id)}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
