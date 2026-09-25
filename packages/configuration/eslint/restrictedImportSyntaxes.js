// Import bans written as selectors rather than as `no-restricted-imports` entries. Oxlint owns that rule, and an
// `.oxlintrc.json` override replaces a rule's options instead of merging them, so every new entry there has to be
// Copied into each of the overrides that restate the list — five today, and a missed copy fails silently in exactly
// The tree that override covers. A list here is spread once into `typescriptRules`, which every ESLint override
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
];
