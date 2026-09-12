import type { IOType } from "node:child_process";

// "pipe" captures stdout/stderr into the ExecResult; "inherit" streams them live to the host terminal.
export type ExecStdio = Extract<IOType, "inherit" | "pipe">;
