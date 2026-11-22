import { setupSyntaxSuite } from "#src/services/setupSyntaxSuite.test";
import restrictedOverloadSyntaxes from "@esposter/configuration/eslint/restrictedOverloadSyntaxes.js";
import { describe } from "vitest";

describe("restrictedOverloadSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedOverloadSyntaxes,
    fixtures: [
      {
        filePath: "overloadFunction.ts",
        name: "overloadFunction",
        source:
          "export function parse(value: string): string;\nexport function parse(value: number): number;\nexport function parse(value: string | number) {\n  return value;\n}",
        violations: 2,
      },
      {
        filePath: "declareFunction.ts",
        name: "declareFunction",
        source: "declare function parse(value: string): string;\ndeclare function parse(value: number): number;",
        violations: 0,
      },
      {
        filePath: "declareModuleOverload.ts",
        name: "declareModuleOverload",
        source:
          'declare module "vue-thing" {\n  export function parse(value: string): string;\n  export function parse(value: number): number;\n}',
        violations: 0,
      },
      {
        filePath: "overloadNamespace.ts",
        name: "overloadNamespace",
        source:
          "export namespace Util {\n  export function parse(value: string): string;\n  export function parse(value: number): number;\n  export function parse(value: unknown) {\n    return value;\n  }\n}",
        violations: 2,
      },
      {
        filePath: "overloadDeclarationFile.d.ts",
        name: "overloadDeclarationFile",
        source: "export function parse(value: string): string;\nexport function parse(value: number): number;",
        violations: 0,
      },
      {
        filePath: "overloadCallSignatures.ts",
        name: "overloadCallSignatures",
        source: "interface Parse {\n  (value: string): string;\n  (value: number): number;\n}",
        violations: 1,
      },
      {
        filePath: "singleCallSignature.ts",
        name: "singleCallSignature",
        source: "interface Parse {\n  (value: string | number): string | number;\n}",
        violations: 0,
      },
      {
        filePath: "singleFunction.ts",
        name: "singleFunction",
        source: "export function parse(value: string) {\n  return value;\n}",
        violations: 0,
      },
      {
        filePath: "overloadClassMethod.ts",
        name: "overloadClassMethod",
        source:
          "export class Parser {\n  parse(value: string): string;\n  parse(value: number): number;\n  parse(value: string | number) {\n    return value;\n  }\n}",
        violations: 2,
      },
      {
        filePath: "singleClassMethod.ts",
        name: "singleClassMethod",
        source: "export class Parser {\n  parse(value: string | number) {\n    return value;\n  }\n}",
        violations: 0,
      },
    ],
  });
});
