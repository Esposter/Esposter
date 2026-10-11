import type { MachinePulse } from "../../models/MachinePulse";

// The pulse script's stdout, its reading as JSON, or nothing where the session is not in this repository. The script
// Writes only its own JSON, so the parse reads no other output and needs no reviver
export const parseMachinePulse = (stdout: string): MachinePulse | undefined =>
  // oxlint-disable-next-line no-restricted-properties -- The plugin's own script writes this JSON, and nothing needs a reviver
  stdout === "" ? undefined : JSON.parse(stdout);
