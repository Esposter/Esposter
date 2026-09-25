import { setupSyntaxSuite } from "#src/setupSyntaxSuite.test";
import typescriptRules from "@esposter/configuration/eslint/typescriptRules.js";
import { describe } from "vitest";

describe("typescriptRules", () => {
  setupSyntaxSuite({
    entries: typescriptRules["no-restricted-syntax"].slice(1),
    fixtures: [
      { filePath: "stringRef.ts", name: "stringRef", source: "export const a = ref<string>();", violations: 1 },
      { filePath: "sentinelRef.ts", name: "sentinelRef", source: `export const a = ref("");`, violations: 0 },
      // An optional ref of anything but a string omits its initial value on purpose
      { filePath: "optionalRef.ts", name: "optionalRef", source: "export const a = ref<A>();", violations: 0 },
      {
        filePath: "undefinedRef.ts",
        name: "undefinedRef",
        source: "export const a = ref<A | undefined>(undefined);",
        violations: 1,
      },
      {
        filePath: "undefinedShallowRef.vue",
        name: "undefinedShallowRef",
        source: `<script setup lang="ts">\nconst a = shallowRef(undefined);\n</script>`,
        violations: 1,
      },
      // A literal argument has no `name`, which esquery would otherwise compare as the string "undefined"
      { filePath: "literalRef.ts", name: "literalRef", source: "export const a = ref(0);", violations: 0 },
      { filePath: "metaDev.ts", name: "metaDev", source: "export const a = import.meta.dev;", violations: 1 },
      { filePath: "metaMode.ts", name: "metaMode", source: "export const a = import.meta.env.MODE;", violations: 1 },
      {
        filePath: "metaProduction.ts",
        name: "metaProduction",
        source: "export const a = import.meta.env.PROD;",
        violations: 1,
      },
      // Any other key off `import.meta` is not the build mode
      { filePath: "metaUrl.ts", name: "metaUrl", source: "export const a = import.meta.url;", violations: 0 },
      { filePath: "metaEnvKey.ts", name: "metaEnvKey", source: "export const a = import.meta.env.A;", violations: 0 },
      { filePath: "exportList.ts", name: "exportList", source: "const a = 0;\nexport { a };", violations: 1 },
      { filePath: "reExport.ts", name: "reExport", source: `export { a } from "a";`, violations: 0 },
      { filePath: "moduleMarker.d.ts", name: "moduleMarker", source: "export {};", violations: 0 },
      {
        filePath: "localStorageLiteral.ts",
        name: "localStorageLiteral",
        source: `export const a = () => useLocalStorage("a", "");`,
        violations: 1,
      },
      {
        filePath: "localStorageTemplate.ts",
        name: "localStorageTemplate",
        source: "export const a = () => localStorage.getItem(`a`);",
        violations: 1,
      },
      {
        filePath: "localStorageRegistry.ts",
        name: "localStorageRegistry",
        source: `export const a = () => useLocalStorage(LocalStorageKey.A, "");`,
        violations: 0,
      },
    ],
  });
});
