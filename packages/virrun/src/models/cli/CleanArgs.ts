import type { ArgDef } from "citty";

export interface CleanArgs {
  [key: string]: ArgDef;
  all: { default: boolean; description: string; type: "boolean" };
}
