import type ts from "typescript";

// A function a kit module declares or passes: an arrow, a function or a method
export type KitModuleFunction =
  | ts.ArrowFunction
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.MethodDeclaration;
