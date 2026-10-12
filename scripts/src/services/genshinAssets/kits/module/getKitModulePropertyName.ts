import ts from "typescript";

// A property's name where it is written out, none where it is computed
export const getKitModulePropertyName = (name: ts.PropertyName): string | undefined =>
  ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name) ? name.text : undefined;
