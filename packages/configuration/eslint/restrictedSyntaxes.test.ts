import { setupSyntaxSuite } from "#src/setupSyntaxSuite.test";
import restrictedSyntaxes from "@esposter/configuration/eslint/restrictedSyntaxes.js";
import { describe } from "vitest";

describe("restrictedSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedSyntaxes,
    fixtures: [
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
