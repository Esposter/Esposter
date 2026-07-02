import type { BackendType } from "@/models/virrun/BackendType";
import type { Environment } from "@/models/virrun/Environment";
import type { ArgDef } from "citty";

export interface InitArgs {
  [key: string]: ArgDef;
  backend: { default: BackendType; description: string; options: BackendType[]; type: "enum" };
  // No `default`: an omitted `--environment` stays undefined (no preset), the same "absence is none" the config uses.
  environment: { description: string; options: Environment[]; required: false; type: "enum" };
  force: { default: boolean; description: string; type: "boolean" };
}
