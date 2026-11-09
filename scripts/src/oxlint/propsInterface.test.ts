import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("propsInterface", () => {
  const NAME = "Props";
  const EXPORTED_TYPE_RULE = "props-interface/no-exported-type";
  const PROPS_NAME_RULE = "props-interface/require-props-name";
  const FIXTURES = [
    // `require-props-name` — the file path spells everything a longer name would repeat.
    {
      name: "namedAfterComponent",
      source: `interface X { a: string }\nconst { a } = defineProps<X>();`,
      violations: 1,
    },
    {
      name: "namedProps",
      source: `interface ${NAME} { a: string }\nconst { a } = defineProps<${NAME}>();`,
      violations: 0,
    },
    // A type alias is the same declaration for this purpose — an intersection cannot be written as an interface.
    { name: "aliasNamedAfterComponent", source: `type X = A & B;\ndefineProps<X>();`, violations: 1 },
    { name: "aliasNamedProps", source: `type ${NAME} = A & B;\ndefineProps<${NAME}>();`, violations: 0 },
    // A generic props type still only has to be named `Props`.
    { name: "genericNamedAfterComponent", source: `interface X<T> { a: T }\ndefineProps<X<string>>();`, violations: 1 },
    {
      name: "genericNamedProps",
      source: `interface ${NAME}<T> { a: T }\ndefineProps<${NAME}<string>>();`,
      violations: 0,
    },
    // A shape this file does not declare is a model or a library type the component is reusing rather than
    // Naming, so there is no local name for the rule to have an opinion about.
    { name: "importedModel", source: `defineProps<X>();`, violations: 0 },
    { name: "importedGeneric", source: `defineProps<X<Y>>();`, violations: 0 },
    { name: "typeExpression", source: `defineProps<Pick<X, "a">>();`, violations: 0 },
    // A local declaration is no less local for reaching the macro through a composite.
    { name: "intersectionWithLocal", source: `interface X { a: string }\ndefineProps<X & Y>();`, violations: 1 },
    { name: "intersectionOfImported", source: `defineProps<Y & T>();`, violations: 0 },
    {
      name: "typeExpressionOverLocal",
      source: `interface X { a: string }\ndefineProps<Pick<X, "a">>();`,
      violations: 1,
    },
    // An inline object literal names nothing, so there is no declaration for the rest of the file to reuse.
    { name: "inlineTypeLiteral", source: `defineProps<{ a: string }>();`, violations: 1 },
    // A declaration nothing passes to `defineProps` is not a props interface — slot props keep descriptive names.
    { name: "unrelatedDeclaration", source: `interface X { a: boolean }`, violations: 0 },
    // Declaration order is not something the author should have to think about.
    { name: "declaredAfterDefineProps", source: `defineProps<X>();\ninterface X { a: string }`, violations: 1 },
    // `no-exported-type` — a shape read outside this file belongs in its own `.ts` beside the component.
    { name: "exportedInterface", source: `export interface X { a: string }`, violations: 1 },
    { name: "exportedTypeAlias", source: `export type X = string;`, violations: 1 },
    { name: "exportedEnum", source: `export enum X { A = "A" }`, violations: 1 },
    // A re-export hands the type out exactly as a declaration would, in either spelling.
    { name: "exportedTypeSpecifier", source: `interface X { a: string }\nexport { type X };`, violations: 1 },
    { name: "exportedTypeStatement", source: `interface X { a: string }\nexport type { X };`, violations: 1 },
    { name: "exportedDefaultInterface", source: `export default interface X { a: string }`, violations: 1 },
    { name: "exportedTypeStar", source: `export type * from "./a";`, violations: 1 },
    { name: "exportedValueStar", source: `export * from "./b";`, violations: 0 },
    // A value re-export is not a type leaving the file.
    { name: "exportedValueSpecifier", source: `const a = 1;\nexport { a };`, violations: 0 },
    // Only type declarations move out; an SFC still exports whatever its own compiler output needs to.
    { name: "exportedConst", source: `export const a = 1;`, violations: 0 },
    { name: "localInterface", source: `interface ${NAME} { a: string }`, violations: 0 },
  ];
  setupPluginSuite({
    extension: ".vue",
    fixtures: FIXTURES,
    plugin: "propsInterface",
    rules: [EXPORTED_TYPE_RULE, PROPS_NAME_RULE],
    wrapSource: (source) => `<script setup lang="ts">\n${source}\n</script>`,
  });
});

describe("props-interface/no-unread-destructure", () => {
  const UNREAD_DESTRUCTURE_RULE = "props-interface/no-unread-destructure";
  const UNREAD_FIXTURES = [
    // A prop the script reads stays destructured, since that is how a reactive prop reaches the script.
    {
      name: "readInComputed",
      source: `const { a } = defineProps<Props>();\nconst b = computed(() => a);`,
      violations: 0,
    },
    {
      name: "readInFunction",
      source: `const { a } = defineProps<Props>();\nfunction b() { return a; }`,
      violations: 0,
    },
    // A default that reads another prop is a read of it, so the prop stays bound for the default to resolve.
    { name: "readByAnotherDefault", source: `const { a, b = a } = defineProps<Props>();`, violations: 0 },
    // A default written in the destructure is how the value is given, so it is kept whether or not it is read.
    { name: "unreadWithDefault", source: `const { a = "" } = defineProps<Props>();`, violations: 0 },
    // An alias is a rename the destructure makes on purpose, so it is kept.
    { name: "unreadAliased", source: `const { a: b } = defineProps<Props>();`, violations: 0 },
    { name: "restOnly", source: `const { ...a } = defineProps<Props>();`, violations: 0 },
    { name: "notDestructured", source: `const props = defineProps<Props>();`, violations: 0 },
    { name: "bareCall", source: `defineProps<Props>();`, violations: 0 },
    { name: "otherDestructure", source: `const { a } = useThing();`, violations: 0 },
    // An unread prop is dropped from the destructure, and the read ones around it keep their places.
    {
      fixed: `const { b } = defineProps<Props>();\nconst c = computed(() => b);`,
      name: "unreadFirst",
      source: `const { a, b } = defineProps<Props>();\nconst c = computed(() => b);`,
      violations: 1,
    },
    {
      fixed: `const { a } = defineProps<Props>();\nconst c = computed(() => a);`,
      name: "unreadLast",
      source: `const { a, b } = defineProps<Props>();\nconst c = computed(() => a);`,
      violations: 1,
    },
    // The rest element is a sibling of the props, so an unread prop before it is removed without touching it.
    {
      fixed: `const { ...b } = defineProps<Props>();`,
      name: "unreadBeforeRest",
      source: `const { a, ...b } = defineProps<Props>();`,
      violations: 1,
    },
    // An aliased prop is exempt, so it survives the removal of the unread one beside it.
    {
      fixed: `const { b: c } = defineProps<Props>();`,
      name: "unreadBesideAlias",
      source: `const { a, b: c } = defineProps<Props>();`,
      violations: 1,
    },
    // Once every prop is dropped the statement is the bare call, and every report of the pattern fixes it in one pass.
    {
      fixed: `defineProps<Props>();`,
      name: "unreadOnly",
      source: `const { a } = defineProps<Props>();`,
      violations: 1,
    },
    {
      fixed: `defineProps<Props>();`,
      name: "unreadAll",
      source: `const { a, b } = defineProps<Props>();`,
      violations: 2,
    },
    // A run of unread props goes with its separators, whether it leads, sits between two kept props, or ends the pattern.
    {
      fixed: `const { c } = defineProps<Props>();\nconst d = computed(() => c);`,
      name: "unreadRunKeepsRead",
      source: `const { a, b, c } = defineProps<Props>();\nconst d = computed(() => c);`,
      violations: 2,
    },
    {
      fixed: `const { b } = defineProps<Props>();\nconst d = computed(() => b);`,
      name: "unreadRunsAroundRead",
      source: `const { a, b, c } = defineProps<Props>();\nconst d = computed(() => b);`,
      violations: 2,
    },
    {
      fixed: `const { a } = defineProps<Props>();\nconst d = computed(() => a);`,
      name: "unreadTrailingRun",
      source: `const { a, b, c } = defineProps<Props>();\nconst d = computed(() => a);`,
      violations: 2,
    },
    {
      fixed: `// a\ndefineProps<Props>();`,
      name: "unreadKeepsLeadingComment",
      source: `// a\nconst { a } = defineProps<Props>();`,
      violations: 1,
    },
    {
      fixed: `const {\n  b,\n} = defineProps<Props>();\nconst c = computed(() => b);`,
      name: "unreadMultiLine",
      source: `const {\n  a,\n  b,\n} = defineProps<Props>();\nconst c = computed(() => b);`,
      violations: 1,
    },
    // Runtime arguments are a props declaration too, and dropping its last binding keeps the declaration.
    {
      fixed: `defineProps({ a: String });`,
      name: "unreadRuntimeArgs",
      source: `const { a } = defineProps({ a: String });`,
      violations: 1,
    },
    // A `withDefaults` call keeps its defaults in the call, so an unread prop beside a read one is dropped alone.
    {
      fixed: `const { b } = withDefaults(defineProps<Props>(), { b: "" });\nconst c = computed(() => b);`,
      name: "unreadWithDefaultsKept",
      source: `const { a, b } = withDefaults(defineProps<Props>(), { b: "" });\nconst c = computed(() => b);`,
      violations: 1,
    },
    // Emptying the pattern would make the bare call drop its defaults, and a bare `withDefaults()` is not a macro,
    // So the declaration is reported without an autofix.
    {
      fixed: `const { a } = withDefaults(defineProps<Props>(), { b: "" });`,
      name: "unreadWithDefaultsEmptied",
      source: `const { a } = withDefaults(defineProps<Props>(), { b: "" });`,
      violations: 1,
    },
    // A sibling declarator would be taken with the statement, so the declaration is reported without an autofix.
    {
      fixed: `const { a } = defineProps<Props>(), b = 0;`,
      name: "unreadWithSiblingDeclarator",
      source: `const { a } = defineProps<Props>(), b = 0;`,
      violations: 1,
    },
  ];
  setupPluginSuite({
    extension: ".vue",
    fixtures: UNREAD_FIXTURES,
    plugin: "propsInterface",
    rules: [UNREAD_DESTRUCTURE_RULE],
    wrapSource: (source) => `<script setup lang="ts">\n${source}\n</script>`,
  });
});
