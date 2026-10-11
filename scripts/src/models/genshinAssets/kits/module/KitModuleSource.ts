import type { KitModuleFunction } from "#src/models/genshinAssets/kits/module/KitModuleFunction";
import type ts from "typescript";

// A kit module's text as the analysis reads it: its tree, the program's checker, and its create function with its name
export interface KitModuleSource {
  checker: ts.TypeChecker;
  createFunction: KitModuleFunction;
  createName: string;
  sourceFile: ts.SourceFile;
}
