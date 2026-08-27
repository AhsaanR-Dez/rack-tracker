import type { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string | undefined;
  children: ReactNode;
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-slate-300">{label}</span>
      {children}
      {error !== undefined && <span className="text-xs text-rose-300">{error}</span>}
    </label>
  );
}

export const inputClass =
  "rounded border border-slate-700 bg-slate-950 px-2 py-1.5 text-slate-100 outline-none focus:border-slate-500";
