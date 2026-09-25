import { setupSyntaxSuite } from "#src/setupSyntaxSuite.test";
import restrictedSourceSyntaxes from "@esposter/configuration/eslint/restrictedSourceSyntaxes.js";
import { describe } from "vitest";

describe("restrictedSourceSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedSourceSyntaxes,
    fixtures: [
      { filePath: "doubleCast.ts", name: "doubleCast", source: "export const a = b as unknown as C;", violations: 1 },
      {
        filePath: "doubleCastComponent.vue",
        name: "doubleCastComponent",
        source: `<script setup lang="ts">\nconst a = b as unknown as C;\n</script>`,
        violations: 1,
      },
      { filePath: "singleCast.ts", name: "singleCast", source: "export const a = b as C;", violations: 0 },
      { filePath: "castToUnknown.ts", name: "castToUnknown", source: "export const a = b as unknown;", violations: 0 },
      // A suite's fakes are where the genuine seams live, so only source is held to it
      {
        filePath: "doubleCast.test.ts",
        name: "doubleCastInTest",
        source: "export const a = b as unknown as C;",
        violations: 0,
      },
      {
        filePath: "discriminatedUnion.ts",
        name: "discriminatedUnion",
        source: `export const aSchema = z.discriminatedUnion("a", []);`,
        violations: 1,
      },
      {
        filePath: "satisfiedDiscriminatedUnion.ts",
        name: "satisfiedDiscriminatedUnion",
        source: `export const aSchema = z.discriminatedUnion("a", []) satisfies z.ZodType<A>;`,
        violations: 0,
      },
    ],
  });
});
