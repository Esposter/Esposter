import ts from "typescript";

// A function or a variable declaration counts as exported when its `export` keyword stands on it or on its statement
export const checkIsExported = (declaration: ts.Declaration): boolean =>
  (ts.getCombinedModifierFlags(declaration) & ts.ModifierFlags.Export) !== 0;
