import type { BackendType } from "@/models/virrun/BackendType";

// Args for `virrun init` (initCommand). Explicit named type (not `typeof initArgs`) so the exported CommandDef
// References a documented type; a type alias (not an interface) keeps the implicit index signature citty's `ArgsDef`
// Constraint needs. `options` stays a mutable `BackendType[]` (citty's EnumArgDef wants a mutable array) and `type`
// Is pinned to the literal "enum" so citty infers `args.backend` as BackendType, not a widened string; the literal is
// Checked with `satisfies ArgsDef` at the use site.
export interface InitArgs {
  backend: { default: BackendType; description: string; options: BackendType[]; type: "enum" };
  force: { default: boolean; description: string; type: "boolean" };
}
