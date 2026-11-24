import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { SCRIPT_FILES } from "#src/services/oxlint/selectorBan/constants";

// Import bans written as selectors rather than as `no-restricted-imports` entries. An `oxlint.config.ts` override
// Replaces that rule's options instead of merging them, so every new entry there has to be copied into each override
// That restates the list, and a missed copy fails silently in exactly the tree that override covers. A list here
// Reaches `.ts`, `.vue` and tests alike with no copy to keep in step.
export const RESTRICTED_IMPORT_SYNTAXES: SelectorBanList = {
  bans: [
    {
      // The `z` namespace is the one spelling: `z.ZodType`, `z.ZodError`. A named type import is the same member under
      // A second name, which a reader then has to map back
      message:
        'Import Zod as the `z` namespace only — `import { z } from "zod"` and `z.ZodError`, never a named import beside it or under another name. See the zod skill.',
      selector:
        "ImportDeclaration[source.value='zod'] > :matches(ImportSpecifier:not([imported.name='z'][local.name='z']), ImportDefaultSpecifier, ImportNamespaceSpecifier)",
    },
    {
      // The editor and the plugins it runs must share one copy of ProseMirror's state classes, and tiptap re-exports
      // Them for exactly that — a `prosemirror-*` package of its own can resolve a second copy an `instanceof` fails on
      message:
        "Import ProseMirror through tiptap's re-export — `@tiptap/pm/state`, never a `prosemirror-*` package — so the editor and its plugins share one copy of the state classes. See the tiptap skill.",
      selector: "ImportDeclaration[source.value=/^prosemirror-/]",
    },
    {
      // `@tiptap/html` resolves its browser build in a Worker, whose `generateHTML` throws wherever `window` is absent,
      // So a render reached from the server fails in production while a Node test, which resolves the happy-dom build,
      // Passes
      message:
        "Render a document to HTML with `renderToHTMLString` from `@tiptap/static-renderer/pm/html-string`, never `@tiptap/html`'s `generateHTML` or `getHTMLFromFragment`, which throw in the web Worker. See the tiptap skill.",
      selector:
        "ImportDeclaration[source.value='@tiptap/html'] > ImportSpecifier[imported.name=/^(?:generateHTML|getHTMLFromFragment)$/]",
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
  ],
  files: SCRIPT_FILES,
};
