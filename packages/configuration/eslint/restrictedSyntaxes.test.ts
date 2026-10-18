import { setupSyntaxSuite } from "#src/setupSyntaxSuite.test";
import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";
import { describe } from "vitest";

describe("restrictedSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedSyntaxes,
    fixtures: [
      {
        filePath: "arrayMethodReference.ts",
        name: "arrayMethodReference",
        source: "const doubled = [1].map(double);",
        violations: 1,
      },
      {
        filePath: "arrayMethodWrapped.ts",
        name: "arrayMethodWrapped",
        source: "const doubled = [1].map((item) => double(item));",
        violations: 0,
      },
      {
        filePath: "arrayMethodCoercion.ts",
        name: "arrayMethodCoercion",
        source: "const numbers = ['1'].map(Number);",
        violations: 0,
      },
      {
        filePath: "arrayReduceReference.ts",
        name: "arrayReduceReference",
        source: "const total = [1].reduce(add, 0);",
        violations: 1,
      },
      {
        filePath: "localEscapeRegExp.ts",
        name: "localEscapeRegExp",
        source: "const escapeRegExp = (value: string) => RegExp(value);",
        violations: 1,
      },
      {
        filePath: "regexpEscape.ts",
        name: "regexpEscape",
        source: "const pattern = new RegExp(RegExp.escape(value), 'u');",
        violations: 0,
      },
    ],
  });
});
