export interface FieldIssue {
  path: string;
  message: string;
}

export class ValidationError extends Error {
  readonly status = 400;
  readonly issues: FieldIssue[];

  constructor(issues: FieldIssue[]) {
    super("Validation failed");
    this.name = "ValidationError";
    this.issues = issues;
  }
}
