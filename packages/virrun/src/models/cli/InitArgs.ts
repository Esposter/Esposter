import type { BackendType } from "@/models/virrun/BackendType";
import type { Environment } from "@/models/virrun/Environment";
import type { ArgDef } from "citty";

export interface InitArgs {
  [key: string]: ArgDef;
  backend: { default: BackendType; description: string; options: BackendType[]; type: "enum" };
  environment: { default: Environment; description: string; options: Environment[]; type: "enum" };
  force: { default: boolean; description: string; type: "boolean" };
}
