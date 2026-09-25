import { setupSyntaxSuite } from "#src/setupSyntaxSuite.test";
import restrictedWatchSyntaxes from "@esposter/configuration/eslint/restrictedWatchSyntaxes.js";
import { describe } from "vitest";

describe("restrictedWatchSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedWatchSyntaxes,
    fixtures: [
      {
        filePath: "watchOption.ts",
        name: "watchOption",
        source: "export const a = () => watch(b, c, { immediate: true });",
        violations: 1,
      },
      {
        filePath: "watchAlias.ts",
        name: "watchAlias",
        source: "export const a = () => watchImmediate(b, c);",
        violations: 0,
      },
      { filePath: "effect.ts", name: "effect", source: "export const a = () => watchEffect(b);", violations: 1 },
      {
        filePath: "postEffect.vue",
        name: "postEffect",
        source: `<script setup lang="ts">\nwatchPostEffect(() => {});\n</script>`,
        violations: 1,
      },
      { filePath: "effect.test.ts", name: "effectInTest", source: "watchSyncEffect(a);", violations: 1 },
    ],
  });
});
