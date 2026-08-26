const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export interface FieldIssue {
  path: string;
  message: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly issues: FieldIssue[];

  constructor(status: number, message: string, issues: FieldIssue[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

interface ErrorBody {
  error?: { status?: number; message?: string; issues?: FieldIssue[] };
}

async function toApiError(response: Response): Promise<ApiError> {
  let parsed: ErrorBody = {};

  try {
    parsed = (await response.json()) as ErrorBody;
  } catch {
    // A non-JSON error body is possible, for example a proxy timing out.
  }

  return new ApiError(
    parsed.error?.status ?? response.status,
    parsed.error?.message ?? response.statusText,
    parsed.error?.issues ?? [],
  );
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as { data: T };
  return payload.data;
}
