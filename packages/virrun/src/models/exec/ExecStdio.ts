// "pipe" captures stdout/stderr into the ExecResult; "inherit" streams them live to the host terminal.
export type ExecStdio = "inherit" | "pipe";
