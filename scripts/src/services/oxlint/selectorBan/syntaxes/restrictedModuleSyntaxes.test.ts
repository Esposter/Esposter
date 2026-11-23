import { setupSelectorBanSuite } from "#src/services/oxlint/selectorBan/setupSelectorBanSuite.test";
import { RESTRICTED_MODULE_SYNTAXES } from "#src/services/oxlint/selectorBan/syntaxes/restrictedModuleSyntaxes";
import { describe } from "vitest";

describe("restrictedModuleSyntaxes", () => {
  setupSelectorBanSuite({
    entries: RESTRICTED_MODULE_SYNTAXES.bans,
    fixtures: [
      { filePath: "moduleRefCall.ts", name: "moduleRefCall", source: "const a = ref(0);", violations: 1 },
      {
        filePath: "exportedModuleReactiveCall.ts",
        name: "exportedModuleReactiveCall",
        source: "export const a = reactive({});",
        violations: 1,
      },
      {
        filePath: "piniaStoreRef.ts",
        name: "piniaStoreRef",
        source: 'export const useRoomStore = defineStore("room", () => {\n  const a = ref(0);\n  return { a };\n});',
        violations: 0,
      },
    ],
  });
});
