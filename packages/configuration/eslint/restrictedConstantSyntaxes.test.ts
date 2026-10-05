import { setupSyntaxSuite } from "#src/setupSyntaxSuite.test";
import restrictedConstantSyntaxes from "@esposter/configuration/eslint/restrictedConstantSyntaxes.js";
import { describe } from "vitest";

describe("restrictedConstantSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedConstantSyntaxes,
    fixtures: [
      {
        filePath: "component.vue",
        name: "component",
        source: `<script setup lang="ts">\nconst A_B = 0;\n</script>`,
        violations: 1,
      },
      {
        filePath: "componentLocal.vue",
        name: "componentLocal",
        source: `<script setup lang="ts">\nconst a = 0;\n</script>`,
        violations: 0,
      },
      {
        filePath: "composables/useA.ts",
        name: "composable",
        source: "export const A_B = 0;\nexport const useA = () => A_B;",
        violations: 1,
      },
      {
        filePath: "composables/useA.test.ts",
        name: "composableTest",
        source: "const A_B = 0;\nexport const a = A_B;",
        violations: 0,
      },
      { filePath: "services/a/constants.ts", name: "constants", source: "export const A_B = 0;", violations: 0 },
    ],
  });
});
