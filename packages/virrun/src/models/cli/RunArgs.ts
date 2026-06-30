// Args for `virrun run` (runCommand). Explicit named type (not `typeof runArgs`) so the exported CommandDef
// references a documented type; a type alias (not an interface) keeps the implicit index signature citty's `ArgsDef`
// Constraint needs. The literal is checked with `satisfies ArgsDef` at the use site.
export type RunArgs = {
  ephemeral: { default: boolean; description: string; type: "boolean" };
};
