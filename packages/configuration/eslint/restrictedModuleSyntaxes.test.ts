import { setupSyntaxSuite } from "#src/services/setupSyntaxSuite.test";
import restrictedModuleSyntaxes from "@esposter/configuration/eslint/restrictedModuleSyntaxes.js";
import { describe } from "vitest";

describe("restrictedModuleSyntaxes", () => {
  setupSyntaxSuite({
    entries: restrictedModuleSyntaxes,
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
