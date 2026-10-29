import type { StyleDeclarations } from "#shared/models/pageBuilder/style/StyleDeclarations";

export const getStyleDeclarationsCss = (declarations: StyleDeclarations) =>
  Object.entries(declarations)
    .map(([property, value]) => `${property}:${value}`)
    .join(";");
