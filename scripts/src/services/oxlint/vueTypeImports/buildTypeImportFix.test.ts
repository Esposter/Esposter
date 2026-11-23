import { setupPluginSuite } from "#src/services/oxlint/shared/setupPluginSuite.test";
import { buildTypeImportFix } from "#src/services/oxlint/vueTypeImports/buildTypeImportFix";
import { describe } from "vitest";

// Each fixture is the whole single-file component, since the rule only reads `.vue` files
const buildComponent = (script: string): string =>
  `<script setup lang="ts">\n${script}\n</script>\n\n<template>\n  <div />\n</template>`;

describe(buildTypeImportFix, () => {
  const SPLIT_SOURCE = buildComponent(
    `import { A, /* note */ B } from "a";\nconst b: A | undefined = undefined;\nconst c = B;`,
  );
  const TYPE_ONLY_SOURCE = buildComponent(`import { /* note */ A } from "a";\nconst b: A | undefined = undefined;`);
  // The fixed source is the unchanged source, since a fixture with no `fixed` checks no fix output at all
  const FIXTURES = [
    { fixed: SPLIT_SOURCE, name: "commentInsideSplitNotFixed", source: SPLIT_SOURCE, violations: 1 },
    { fixed: TYPE_ONLY_SOURCE, name: "commentInsideTypeOnlyNotFixed", source: TYPE_ONLY_SOURCE, violations: 1 },
  ];
  setupPluginSuite({
    extension: ".vue",
    fixtures: FIXTURES,
    plugin: "vueTypeImports",
    rules: ["vue-type-imports/require-import-type"],
  });
});
