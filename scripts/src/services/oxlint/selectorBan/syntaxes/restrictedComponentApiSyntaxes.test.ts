import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_COMPONENT_API_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedComponentApiSyntaxes";
import { describe } from "vitest";

describe("restrictedComponentApiSyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_COMPONENT_API_SYNTAXES.bans,
    fixtures: [
      {
        filePath: "OptionsObject.vue",
        name: "optionsObject",
        source: '<script lang="ts">\nexport default { data: () => ({ a: 1 }) };\n</script>',
        violations: 1,
      },
      {
        filePath: "DefinedComponent.vue",
        name: "definedComponent",
        source: '<script lang="ts">\nexport default defineComponent({ setup: () => ({}) });\n</script>',
        violations: 1,
      },
      {
        filePath: "ScriptSetup.vue",
        name: "scriptSetup",
        source: '<script setup lang="ts">\nconst a = 1;\n</script>',
        violations: 0,
      },
      // A plain module exports what it likes; only a component's script is held to script setup
      { filePath: "options.ts", name: "moduleObject", source: "export default { a: 1 };", violations: 0 },
    ],
  });
});
