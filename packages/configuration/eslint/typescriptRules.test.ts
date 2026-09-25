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
        filePath: "destructuredEvent.ts",
        name: "destructuredEvent",
        source: "export const a = ({ key }: KeyboardEvent) => key;",
        violations: 1,
      },
      {
        filePath: "destructuredListenerEvent.ts",
        name: "destructuredListenerEvent",
        source: `export const a = () => window.addEventListener("message", ({ data }) => data);`,
        violations: 1,
      },
      {
        filePath: "destructuredKeyStroke.ts",
        name: "destructuredKeyStroke",
        source: `export const a = () => onKeyStroke("a", ({ key }) => key);`,
        violations: 1,
      },
      {
        filePath: "wholeEvent.ts",
        name: "wholeEvent",
        source: "export const a = (event: KeyboardEvent) => event.key;",
        violations: 0,
      },
      // A payload that is not an event keeps its destructuring
      {
        filePath: "destructuredPayload.ts",
        name: "destructuredPayload",
        source: "export const a = ({ b }: A) => b;",
        violations: 0,
      },
      { filePath: "nativeEnum.ts", name: "nativeEnum", source: "export const a = z.nativeEnum(A);", violations: 1 },
      {
        filePath: "chainedEmail.ts",
        name: "chainedEmail",
        source: "export const a = z.string().min(1).email();",
        violations: 1,
      },
      { filePath: "chainedInt.ts", name: "chainedInt", source: "export const a = z.number().int();", violations: 1 },
      {
        filePath: "chainedStrict.ts",
        name: "chainedStrict",
        source: "export const a = z.object({}).strict();",
        violations: 1,
      },
      { filePath: "topLevelEmail.ts", name: "topLevelEmail", source: "export const a = z.email();", violations: 0 },
      { filePath: "topLevelInt.ts", name: "topLevelInt", source: "export const a = z.int();", violations: 0 },
      // The validator names are ordinary methods anywhere a Zod chain does not lead to them
      { filePath: "otherDate.ts", name: "otherDate", source: "export const a = b.date();", violations: 0 },
      {
        filePath: "refineMessage.ts",
        name: "refineMessage",
        source: `export const a = z.string().refine(b, { message: "c" });`,
        violations: 1,
      },
      {
        filePath: "refineError.ts",
        name: "refineError",
        source: `export const a = z.string().refine(b, { error: "c" });`,
        violations: 0,
      },
      {
        filePath: "localStorageRegistry.ts",
        name: "localStorageRegistry",
        source: `export const a = () => useLocalStorage(LocalStorageKey.A, "");`,
        violations: 0,
      },
      {
        filePath: "resourceAliases.ts",
        name: "resourceAliases",
        source: `export const a = new B("b", {}, { aliases: [] });`,
        violations: 1,
      },
      {
        filePath: "resourceOptions.ts",
        name: "resourceOptions",
        source: `export const a = new B("b", {}, { protect: true });`,
        violations: 0,
      },
      // Only the options argument is a resource's; an `aliases` key anywhere else is some other API's
      {
        filePath: "argumentAliases.ts",
        name: "argumentAliases",
        source: "export const a = new B({ aliases: [] });",
        violations: 0,
      },
      { filePath: "isOk.ts", name: "isOk", source: "export const a = b.isOk();", violations: 1 },
      { filePath: "isErrInTest.test.ts", name: "isErrInTest", source: "a.isErr();", violations: 1 },
      { filePath: "resultMatch.ts", name: "resultMatch", source: "export const a = b.match(c, d);", violations: 0 },
    ],
  });
});
