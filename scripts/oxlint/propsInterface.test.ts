import { setupPluginSuite } from "#scripts/oxlint/setupPluginSuite.test";
import { describe, expect, test } from "vitest";

// Both rules are oxlint JS plugins; the harness that runs them over these fixtures is setupPluginSuite.
const EXPORTED_TYPE_RULE = "props-interface/no-exported-type";
const PROPS_NAME_RULE = "props-interface/require-props-name";

describe("props-interface", () => {
  const FIXTURES = [
    // `require-props-name` — the file path spells everything a longer name would repeat.
    {
      name: "namedAfterComponent",
      source: `interface FooBarProps { a: string }\nconst { a } = defineProps<FooBarProps>();`,
      violations: 1,
    },
    { name: "namedProps", source: `interface Props { a: string }\nconst { a } = defineProps<Props>();`, violations: 0 },
    // A type alias is the same declaration for this purpose — an intersection cannot be written as an interface.
    { name: "aliasNamedAfterComponent", source: `type FooProps = A & B;\ndefineProps<FooProps>();`, violations: 1 },
    { name: "aliasNamedProps", source: `type Props = A & B;\ndefineProps<Props>();`, violations: 0 },
    // A generic props type still only has to be named `Props`.
    {
      name: "genericNamedAfterComponent",
      source: `interface FooProps<T> { a: T }\ndefineProps<FooProps<string>>();`,
      violations: 1,
    },
    { name: "genericNamedProps", source: `interface Props<T> { a: T }\ndefineProps<Props<string>>();`, violations: 0 },
    // A shape this file does not declare is a model or a library type the component is reusing rather than
    // Naming, so there is no local name for the rule to have an opinion about.
    { name: "importedModel", source: `defineProps<LinkPreviewResponse>();`, violations: 0 },
    { name: "importedGeneric", source: `defineProps<SuggestionProps<Emoji>>();`, violations: 0 },
    { name: "typeExpression", source: `defineProps<Pick<DialogProps, "cardProps">>();`, violations: 0 },
    // A local declaration is no less local for reaching the macro through a composite.
    {
      name: "intersectionWithLocal",
      source: `interface FooProps { a: string }\ndefineProps<FooProps & SharedProps>();`,
      violations: 1,
    },
    { name: "intersectionOfImported", source: `defineProps<SharedProps & OtherProps>();`, violations: 0 },
    {
      name: "typeExpressionOverLocal",
      source: `interface FooProps { a: string }\ndefineProps<Pick<FooProps, "a">>();`,
      violations: 1,
    },
    // An inline object literal names nothing, so there is no declaration for the rest of the file to reuse.
    { name: "inlineTypeLiteral", source: `defineProps<{ a: string }>();`, violations: 1 },
    // A declaration nothing passes to `defineProps` is not a props interface — slot props keep descriptive names.
    { name: "unrelatedDeclaration", source: `interface ActivatorSlotProps { isOpen: boolean }`, violations: 0 },
    // Declaration order is not something the author should have to think about.
    {
      name: "declaredAfterDefineProps",
      source: `defineProps<FooProps>();\ninterface FooProps { a: string }`,
      violations: 1,
    },
    // `no-exported-type` — a shape read outside this file belongs in its own `.ts` beside the component.
    { name: "exportedInterface", source: `export interface FooProps { a: string }`, violations: 1 },
    { name: "exportedTypeAlias", source: `export type Foo = string;`, violations: 1 },
    { name: "exportedEnum", source: `export enum Foo { A = "A" }`, violations: 1 },
    // A re-export hands the type out exactly as a declaration would, in either spelling.
    { name: "exportedTypeSpecifier", source: `interface Foo { a: string }\nexport { type Foo };`, violations: 1 },
    { name: "exportedTypeStatement", source: `interface Foo { a: string }\nexport type { Foo };`, violations: 1 },
    { name: "exportedDefaultInterface", source: `export default interface Foo { a: string }`, violations: 1 },
    // A value re-export is not a type leaving the file.
    { name: "exportedValueSpecifier", source: `const foo = 1;\nexport { foo };`, violations: 0 },
    // Only type declarations move out; an SFC still exports whatever its own compiler output needs to.
    { name: "exportedConst", source: `export const FOO = 1;`, violations: 0 },
    { name: "localInterface", source: `interface Props { a: string }`, violations: 0 },
  ];
  const { getCodes, getViolations } = setupPluginSuite({
    extension: ".vue",
    fixtures: FIXTURES,
    plugin: "propsInterface",
    rules: [EXPORTED_TYPE_RULE, PROPS_NAME_RULE],
    wrapSource: (source) => `<script setup lang="ts">\n${source}\n</script>`,
  });

  test.each(FIXTURES)("reports $violations violation(s) for $name", ({ name, violations }) => {
    expect.hasAssertions();

    expect(getViolations(name)).toBe(violations);
  });

  test("reports nothing but these two rules", () => {
    expect.hasAssertions();

    expect([...new Set(getCodes())].toSorted()).toStrictEqual([
      "props-interface(no-exported-type)",
      "props-interface(require-props-name)",
    ]);
  });
});
