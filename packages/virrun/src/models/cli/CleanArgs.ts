// Args for `virrun cache clean` (cacheCleanCommand). Explicit named type (not `typeof cleanArgs`) so the exported
// CommandDef references a documented type; a type alias (not an interface) keeps the implicit index signature citty's
// `ArgsDef` constraint needs. The literal is checked with `satisfies ArgsDef` at the use site.
export interface CleanArgs {
  all: { default: boolean; description: string; type: "boolean" };
}
