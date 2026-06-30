import type { ArgDef } from "citty";

export interface RunArgs {
  [key: string]: ArgDef;
  ephemeral: { default: boolean; description: string; type: "boolean" };
}
