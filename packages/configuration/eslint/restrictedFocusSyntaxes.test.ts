import { setupSyntaxSuite } from "#src/services/setupSyntaxSuite.test";
import restrictedFocusSyntaxes from "@esposter/configuration/eslint/restrictedFocusSyntaxes.js";
import { describe } from "vitest";

const focusOnMountSource = '<script setup lang="ts">\nonMounted(() => {\n  input.value?.focus();\n});\n</script>';

describe("restrictedFocusSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedFocusSyntaxes,
    fixtures: [
      { filePath: "app/components/focusOnMount.vue", name: "focusOnMount", source: focusOnMountSource, violations: 1 },
      {
        filePath: "app/composables/focusOnMount.ts",
        name: "composableFocusOnMount",
        source: "export const useThing = () => {\n  onMounted(() => {\n    input.value?.focus();\n  });\n};",
        violations: 1,
      },
      {
        filePath: "app/components/focusAfterAction.vue",
        name: "focusAfterAction",
        source:
          '<script setup lang="ts">\nwatch(selected, async () => {\n  await nextTick();\n  row.value?.focus();\n});\n</script>',
        violations: 0,
      },
      {
        filePath: "app/components/editorChain.vue",
        name: "editorChain",
        source: '<script setup lang="ts">\nonMounted(() => {\n  editor.chain().focus().run();\n});\n</script>',
        violations: 0,
      },
      { filePath: "src/components/gameScreen.vue", name: "gameScreen", source: focusOnMountSource, violations: 0 },
    ],
  });
});
