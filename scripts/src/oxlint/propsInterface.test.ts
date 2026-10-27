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
