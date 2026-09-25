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
      {
        filePath: "swallowingMatch.ts",
        name: "swallowingMatch",
        source: "export const a = b.match(noop, noop);",
        violations: 1,
      },
      {
        filePath: "loggingMatch.ts",
        name: "loggingMatch",
        source: "export const a = b.match(noop, console.error);",
        violations: 0,
      },
      {
        filePath: "fromThrowable.ts",
        name: "fromThrowable",
        source: "export const a = ResultAsync.fromThrowable(b)();",
        violations: 1,
      },
      { filePath: "fromPromise.ts", name: "fromPromise", source: "export const a = fromPromise(b, c);", violations: 1 },
      {
        filePath: "getResult.ts",
        name: "getResult",
        source: "export const a = getResultAsync(() => b());",
        violations: 0,
      },
      { filePath: "emptyOkHandler.ts", name: "emptyOkHandler", source: "b.match(() => {}, c);", violations: 1 },
      {
        filePath: "undefinedOkHandler.ts",
        name: "undefinedOkHandler",
        source: "export const a = async () => {\n  await b.match(() => undefined, c);\n};",
        violations: 1,
      },
      {
        filePath: "returnedOkHandler.ts",
        name: "returnedOkHandler",
        source: "export const a = () => b.match(() => undefined, c);",
        violations: 1,
      },
      // Assigned, the ok arm is the value a caller reads, which `noop`'s `void` would refuse
      {
        filePath: "valueOkHandler.ts",
        name: "valueOkHandler",
        source: "export const a = await b.match(() => undefined, (error) => error);",
        violations: 0,
      },
      { filePath: "noopOkHandler.ts", name: "noopOkHandler", source: "b.match(noop, c);", violations: 0 },
      { filePath: "showFlag.ts", name: "showFlag", source: "export const showA = ref(false);", violations: 1 },
      {
        filePath: "showProp.ts",
        name: "showProp",
        source: "export interface A {\n  showB?: boolean;\n}",
        violations: 1,
      },
      {
        filePath: "showDeclaredNamespace.d.ts",
        name: "showDeclaredNamespace",
        source: "declare namespace A {\n  interface B {\n    showC?: boolean;\n  }\n}",
        violations: 0,
      },
      { filePath: "showFunction.ts", name: "showFunction", source: "export const showA = () => b();", violations: 0 },
      {
        filePath: "showMock.test.ts",
        name: "showMock",
        source: "const showA = vi.hoisted(() => vi.fn<() => void>());\nshowA();",
        violations: 0,
      },
      {
        filePath: "visibleFlag.ts",
        name: "visibleFlag",
        source: "export const isAVisible = ref(false);",
        violations: 0,
      },
      {
        filePath: "underscoreAlias.ts",
        name: "underscoreAlias",
        source: `import { a as _a } from "a";\nexport const b = _a;`,
        violations: 1,
      },
      {
        filePath: "baseAlias.ts",
        name: "baseAlias",
        source: `import { a as baseA } from "a";\nexport const b = baseA;`,
        violations: 0,
      },
      { filePath: "regexPattern.ts", name: "regexPattern", source: "export const A_PATTERN = /a/u;", violations: 1 },
      {
        filePath: "constructedRegex.ts",
        name: "constructedRegex",
        source: `const A_RE = new RegExp(\`\${b}\`, "u");\nexport const c = A_RE;`,
        violations: 1,
      },
      { filePath: "regexSuffix.ts", name: "regexSuffix", source: "export const A_REGEX = /a/u;", violations: 0 },
      // A local inside a function is not a named constant
      {
        filePath: "localRegex.ts",
        name: "localRegex",
        source: "export const a = () => {\n  const b = /a/u;\n  return b;\n};",
        violations: 0,
      },
      {
        filePath: "letterComparator.ts",
        name: "letterComparator",
        source: "export const c = d.toSorted((a, b) => a - b);",
        violations: 2,
      },
      {
        filePath: "namedComparator.ts",
        name: "namedComparator",
        source: "export const c = d.toSorted((firstD, secondD) => firstD - secondD);",
        violations: 0,
      },
      {
        filePath: "namedColumn.ts",
        name: "namedColumn",
        source: `export const a = pgTable("a", { b: text("b").notNull() });`,
        violations: 1,
      },
      {
        filePath: "bareColumn.ts",
        name: "bareColumn",
        source: `export const a = pgTable("a", { b: text().notNull().default("c") });`,
        violations: 0,
      },
      // A constraint builder takes its name, and lives outside the columns object
      {
        filePath: "namedConstraint.ts",
        name: "namedConstraint",
        source: `export const a = pgTable("a", { b: text() }, { extraConfig: ({ b }) => [index("a_b_index").on(b)] });`,
        violations: 0,
      },
      {
        filePath: "literalLimit.ts",
        name: "literalLimit",
        source: "export const a = await db.query.b.findMany({ limit: 10 });",
        violations: 1,
      },
      {
        filePath: "namedLimit.ts",
        name: "namedLimit",
        source: "export const a = await db.query.b.findMany({ limit: MAX_READ_LIMIT });",
        violations: 0,
      },
      {
        filePath: "nullClauseTypeArgument.ts",
        name: "nullClauseTypeArgument",
        source: "export const a = getTableNullClause<B>(C.d);",
        violations: 1,
      },
      {
        filePath: "nullClause.ts",
        name: "nullClause",
        source: "export const a = getTableNullClause(C.d);",
        violations: 0,
      },
      {
        filePath: "spreadFactory.ts",
        name: "spreadFactory",
        source: "export const a = { ...getTsdownConfigurationNode(), deps: {} };",
        violations: 1,
      },
      {
        filePath: "mergedFactory.ts",
        name: "mergedFactory",
        source: "export const a = mergeConfig(getTsdownConfigurationNode(), { deps: {} });",
        violations: 0,
      },
    ],
  });
});
