import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_UTILITY_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedUtilitySyntaxes";
import { describe } from "vitest";

describe("restrictedUtilitySyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_UTILITY_SYNTAXES.bans,
    fixtures: [
      {
        filePath: "app/components/bareBracket.vue",
        name: "bareBracket",
        source: "<template><div w-[1rem] /></template>",
        violations: 1,
      },
      {
        filePath: "app/components/valuedBracket.vue",
        name: "valuedBracket",
        source: '<template><div w="[1rem]" /></template>',
        violations: 0,
      },
      {
        filePath: "app/components/buttonLayout.vue",
        name: "buttonLayout",
        source: "<template><UiButton flex /></template>",
        violations: 1,
      },
      {
        filePath: "app/components/rowLayout.vue",
        name: "rowLayout",
        source: "<template><div ui-row gap-2 px-2 /></template>",
        violations: 2,
      },
      {
        filePath: "app/components/plainLayout.vue",
        name: "plainLayout",
        source: "<template><UiButton /><div flex gap-2 px-2 /></template>",
        violations: 0,
      },
    ],
  });
});
