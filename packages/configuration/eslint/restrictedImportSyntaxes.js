// Import bans written as selectors rather than as `no-restricted-imports` entries. Oxlint owns that rule, and an
// `oxlint.config.ts` override replaces a rule's options instead of merging them, so every new entry there has to be
// Copied into each of the overrides that restate the list, and a missed copy fails silently in exactly the tree
// That override covers. A list here is spread once into `typescriptRules`, which every ESLint override
// Already carries, so a ban reaches `.ts`, `.vue` and tests alike with no copy to keep in step.
export default [
  {
    // The `z` namespace is the one spelling: `z.ZodType`, `z.ZodError`. A named type import is the same member under
    // A second name, which a reader then has to map back
    message:
      'Import Zod as the `z` namespace only — `import { z } from "zod"` and `z.ZodError`, never a named import beside it. See the zod skill.',
    selector:
      "ImportDeclaration[source.value='zod'] > :matches(ImportSpecifier[imported.name!='z'], ImportDefaultSpecifier, ImportNamespaceSpecifier)",
  },
  {
    // The editor and the plugins it runs must share one copy of ProseMirror's state classes, and tiptap re-exports
    // Them for exactly that — a `prosemirror-*` package of its own can resolve a second copy an `instanceof` fails on
    message:
      "Import ProseMirror through tiptap's re-export — `@tiptap/pm/state`, never a `prosemirror-*` package — so the editor and its plugins share one copy of the state classes. See the tiptap skill.",
    selector: "ImportDeclaration[source.value=/^prosemirror-/]",
  },
  {
    // Both storage SDKs re-export the one `RestError` class, so an `instanceof` against a re-export holds only while
    // The two resolve one shared copy — the day a bump splits them, the check silently stops recognising the other
    // SDK's errors. The class's own package is the one both depend on
    message:
      "Import `RestError` from `@azure/core-rest-pipeline`, never a storage SDK's re-export — an `instanceof` against one stops matching the other SDK's errors the day their copies split. See the azure-table skill.",
    selector:
      "ImportDeclaration[source.value=/^@azure.(data-tables|storage-blob|storage-queue)$/] > ImportSpecifier[imported.name='RestError']",
  },
  {
    // `drizzle-zod` is the v1 package; the v2 relations API the repo is on ships its own schema builders, and the two
    // Generate from different table metadata
    message:
      "Import `createSelectSchema` from `drizzle-orm/zod`, never the v1 `drizzle-zod` package. See the drizzle skill.",
    selector: "ImportDeclaration[source.value='drizzle-zod']",
  },
  {
    // The repo is on the v2 relations API, which v1's `relations()` is incompatible with — a part written with it
    // Is not one `defineRelations` can compose
    message:
      "Write a relations part with v2's `defineRelationsPart`, never the v1 `relations()` from `drizzle-orm`. See the drizzle skill.",
    selector: "ImportDeclaration[source.value='drizzle-orm'] > ImportSpecifier[imported.name='relations']",
  },
  {
    // The provider packages are CommonJS that lazy-load every submodule through getters, and a named ESM import
    // Evaluates them all eagerly — so a Pulumi package is the one library imported as a namespace, type imports too
    message:
      'Import a Pulumi package as a namespace — `import * as pulumi from "@pulumi/pulumi"` — never a named import, which evaluates every lazily-loaded submodule. See the pulumi-infra skill.',
    selector: "ImportDeclaration[source.value=/^@pulumi./] > :matches(ImportSpecifier, ImportDefaultSpecifier)",
  },
];
