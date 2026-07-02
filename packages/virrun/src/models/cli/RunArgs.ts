import type { ArgDef } from "citty";

export interface RunArgs {
  [key: string]: ArgDef;
  // Negatable boolean, on by default; `--no-cache` forces real execution, skipping both replay and recording.
  cache: { default: boolean; description: string; type: "boolean" };
  ephemeral: { default: boolean; description: string; type: "boolean" };
}
