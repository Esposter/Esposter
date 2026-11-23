import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { describe } from "vitest";

describe("vueTypeImports", () => {
  const RULE = "vue-type-imports/require-import-type";
  const DEFAULT_TEMPLATE = "<template>\n  <div />\n</template>";
  // Each fixture is the whole single-file component, since the template is what a binding can be named from
  const buildComponent = (script: string, template = DEFAULT_TEMPLATE): string =>
    `<script setup lang="ts">\n${script}\n</script>\n\n${template}`;

  const FIXTURES = [
    {
      fixed: buildComponent(`import type { A } from "a";\nconst b: A | undefined = undefined;`),
      name: "typeOnlyNamed",
      source: buildComponent(`import { A } from "a";\nconst b: A | undefined = undefined;`),
      violations: 1,
    },
    // A type-only binding splits out of a declaration that keeps its value bindings
    {
      fixed: buildComponent(
        `import type { A } from "a";\nimport { B } from "a";\nconst b: A | undefined = undefined;\nconst c = B;`,
      ),
      name: "mixedSpecifiers",
      source: buildComponent(`import { A, B } from "a";\nconst b: A | undefined = undefined;\nconst c = B;`),
      violations: 1,
    },
    { name: "valueUsed", source: buildComponent(`import { A } from "a";\nconst b = A;`), violations: 0 },
    // A type-only binding that is an inline `type` specifier is already typed, and its sibling is the one reported
    {
      fixed: buildComponent(
        `import type { B } from "a";\nimport { type A } from "a";\nconst b: A | B | undefined = undefined;`,
      ),
      name: "inlineTypeBesideTypeOnly",
      source: buildComponent(`import { type A, B } from "a";\nconst b: A | B | undefined = undefined;`),
      violations: 1,
    },
    {
      name: "alreadyTypeImport",
      source: buildComponent(`import type { A } from "a";\nconst b: A | undefined = undefined;`),
      violations: 0,
    },
    {
      name: "inlineTypeSpecifier",
      source: buildComponent(`import { type A } from "a";\nconst b: A | undefined = undefined;`),
      violations: 0,
    },
    // A binding nothing in the script reads is not a type, and a component the template reads is a value
    { name: "unusedImport", source: buildComponent(`import { A } from "a";`), violations: 0 },
    {
      name: "componentOnlyInTemplate",
      source: buildComponent(`import MyThing from "c";`, "<template>\n  <MyThing />\n</template>"),
      violations: 0,
    },
    // The template names a type's enum as a value, so the import stays a value
    {
      name: "typeUsedAsValueInTemplate",
      source: buildComponent(
        `import { MessageType } from "m";\nconst b: MessageType | undefined = undefined;`,
        "<template>\n  <p>{{ MessageType.Text }}</p>\n</template>",
      ),
      violations: 0,
    },
    // A component used as a type in the script and as a kebab-case tag in the template is a value
    {
      name: "typeUsedAsKebabTagInTemplate",
      source: buildComponent(
        `import MyThing from "c";\nconst b: MyThing | undefined = undefined;`,
        "<template>\n  <my-thing />\n</template>",
      ),
      violations: 0,
    },
    // A name used after a nested `<template v-if>` is still in the root block, so the nested close does not end the search
    {
      name: "templateNameAfterNestedTemplate",
      source: buildComponent(
        `import MyThing from "c";\nconst b: MyThing | undefined = undefined;`,
        '<template>\n  <template v-if="b">\n    <p />\n  </template>\n  <MyThing />\n</template>',
      ),
      violations: 0,
    },
    // The template-only sibling is kept as a value, so the type-only binding is split out beside it
    {
      fixed: buildComponent(
        `import type { A } from "c";\nimport { Comp } from "c";\nconst b: A | undefined = undefined;`,
        "<template>\n  <Comp />\n</template>",
      ),
      name: "templateOnlySibling",
      source: buildComponent(
        `import { A, Comp } from "c";\nconst b: A | undefined = undefined;`,
        "<template>\n  <Comp />\n</template>",
      ),
      violations: 1,
    },
    // `typeof` names a value's type, and the import is erased with it
    {
      fixed: buildComponent(`import type { B } from "b";\nconst c: typeof B | undefined = undefined;`),
      name: "typeofInType",
      source: buildComponent(`import { B } from "b";\nconst c: typeof B | undefined = undefined;`),
      violations: 1,
    },
    { name: "typeofAsValue", source: buildComponent(`import { B } from "b";\nconst c = typeof B;`), violations: 0 },
    {
      fixed: buildComponent(`import type * as NS from "ns";\nconst c: NS.Thing | undefined = undefined;`),
      name: "namespaceQualifiedType",
      source: buildComponent(`import * as NS from "ns";\nconst c: NS.Thing | undefined = undefined;`),
      violations: 1,
    },
    {
      fixed: buildComponent(`import type Thing from "t";\nconst c: Thing | undefined = undefined;`),
      name: "defaultOnlyType",
      source: buildComponent(`import Thing from "t";\nconst c: Thing | undefined = undefined;`),
      violations: 1,
    },
    // A default binding cannot share an `import type` with named ones, so the two split
    {
      fixed: buildComponent(
        `import type Thing from "t";\nimport type { Other } from "t";\nconst c: Thing | Other | undefined = undefined;`,
      ),
      name: "defaultAndNamedAllType",
      source: buildComponent(`import Thing, { Other } from "t";\nconst c: Thing | Other | undefined = undefined;`),
      violations: 1,
    },
    {
      fixed: buildComponent(
        `import type { A } from "a";\ninterface B extends A {\n  b: string;\n}\nconst c: B | undefined = undefined;`,
      ),
      name: "interfaceHeritage",
      source: buildComponent(
        `import { A } from "a";\ninterface B extends A {\n  b: string;\n}\nconst c: B | undefined = undefined;`,
      ),
      violations: 1,
    },
    // A class's `implements` clause and a type literal's computed key are type positions, as typescript-eslint reads them
    {
      fixed: buildComponent(`import type { A } from "a";\nclass C implements A {}`),
      name: "classImplements",
      source: buildComponent(`import { A } from "a";\nclass C implements A {}`),
      violations: 1,
    },
    {
      fixed: buildComponent(`import type { K } from "k";\nconst b: { [K]: string } | undefined = undefined;`),
      name: "typeLiteralComputedKey",
      source: buildComponent(`import { K } from "k";\nconst b: { [K]: string } | undefined = undefined;`),
      violations: 1,
    },
  ];
  setupPluginSuite({ extension: ".vue", fixtures: FIXTURES, plugin: "vueTypeImports", rules: [RULE] });
});
