import type { Equipment, EquipmentStatus, Rack } from "../types";

const STATUS_STYLES: Record<EquipmentStatus, string> = {
  active: "bg-emerald-500/15 border-emerald-500/40 text-emerald-200",
  inactive: "bg-slate-500/15 border-slate-500/40 text-slate-300",
  maintenance: "bg-amber-500/15 border-amber-500/40 text-amber-200",
  decommissioned: "bg-rose-500/15 border-rose-500/40 text-rose-200",
};

const UNIT_HEIGHT_PX = 22;

interface RackCardProps {
  rack: Rack;
  equipment: Equipment[];
  onDelete: (rack: Rack) => void;
}

export function RackCard({ rack, equipment, onDelete }: RackCardProps) {
  const usedUnits = equipment.reduce((total, item) => total + item.unitHeight, 0);

  return (
    <section className="rounded-lg border border-slate-700 bg-slate-900/60 p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">{rack.name}</h2>
          <p className="text-sm text-slate-400">{rack.location}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-300">
            {usedUnits} / {rack.totalUnits}U
          </p>
          <button
            type="button"
            onClick={() => {
              onDelete(rack);
            }}
            className="mt-1 text-xs text-rose-300 hover:text-rose-200"
          >
            Delete
          </button>
        </div>
      </header>

      <div
        className="relative grid gap-px rounded border border-slate-700 bg-slate-800"
        style={{
          gridTemplateRows: `repeat(${String(rack.totalUnits)}, ${String(UNIT_HEIGHT_PX)}px)`,
        }}
      >
        {Array.from({ length: rack.totalUnits }, (_, index) => (
          <div key={rack.totalUnits - index} className="bg-slate-900/80" />
        ))}

        {equipment.map((item) => {
          const topUnit = item.startUnit + item.unitHeight - 1;
          const rowStart = rack.totalUnits - topUnit + 1;

          return (
            <div
              key={item.id}
              style={{ gridRow: `${String(rowStart)} / span ${String(item.unitHeight)}` }}
              className={`col-start-1 row-start-1 z-10 flex items-center justify-between gap-2 overflow-hidden rounded border px-2 text-xs ${STATUS_STYLES[item.status]}`}
              title={`${item.hostname} (${item.model}) U${String(item.startUnit)}-U${String(topUnit)}`}
            >
              <span className="truncate font-medium">{item.hostname}</span>
              <span className="shrink-0 tabular-nums opacity-70">
                U{item.startUnit}
                {item.unitHeight > 1 ? `-${String(topUnit)}` : ""}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
