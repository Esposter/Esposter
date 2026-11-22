import type { Declaration } from "oxc-parser";

// The names a top-level declaration exports: each identifier a variable statement declares, else the declaration's own
export const getDeclarationNames = (declaration: Declaration): string[] => {
  if (declaration.type === "VariableDeclaration")
    return declaration.declarations.flatMap(({ id }) => (id.type === "Identifier" ? [id.name] : []));
  return "id" in declaration && declaration.id?.type === "Identifier" ? [declaration.id.name] : [];
};
