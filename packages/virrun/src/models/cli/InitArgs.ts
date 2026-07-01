import type { BackendType } from "@/models/virrun/BackendType";
import type { ArgDef } from "citty";

export interface InitArgs {
  [key: string]: ArgDef;
  backend: { default: BackendType; description: string; options: BackendType[]; type: "enum" };
  force: { default: boolean; description: string; type: "boolean" };
}
