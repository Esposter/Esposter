// Thrown by the in-process runner's process.exit override so a workload calling process.exit(n)
// Unwinds back to the runner carrying its code, instead of killing the host process. Extends Error so
// It survives getResult's toAppError (which passes Errors through untouched) and stays instanceof-checkable.
export class ExitSignalError extends Error {
  readonly code: number;

  constructor(code: number) {
    super(`process.exit(${code})`);
    this.name = "ExitSignalError";
    this.code = code;
  }
}
