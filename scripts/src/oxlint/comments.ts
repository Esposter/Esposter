import type { Plugin } from "@oxlint/plugins";

import { noCapitalizedIdentifier } from "#src/services/oxlint/comments/noCapitalizedIdentifier";
import { definePlugin } from "@oxlint/plugins";
/**
 * An oxlint JS plugin enforcing the formatting skill's rule that a `//` line never opens on a bare identifier.
 * `capitalized-comments` uppercases the first letter of every `//` line and cannot tell a prose word from a name, so a
 * rewrap that puts `useEditor` at a line front comes back as `UseEditor` — and `--fix` writes it. The comments sweep
 * found that corruption in two passes before it reached here.
 *
 * It reads one file and two vocabularies the repo cannot outgrow. A capitalised opening word is reported when its
 * lowercase-first spelling starts with one of the naming skill's function or boolean prefixes (or a composable's
 * `use`) and then a capital, wherever that name is declared — no type or proper name is spelled that way. Otherwise
 * it is reported only on a line carrying on the sentence of the `//` line above, when its lowercase-first spelling
 * is a code-shaped identifier in the same file and its own spelling is not: a sentence start may open on a proper
 * name the file binds camel-cased (`GrapesJS`, imported as `grapesJS`), and a single lowercase word (`result`)
 * reads the same capitalised as the prose word. A tool name or a path the file never binds stays with the comments
 * ledger's grep, since recognising one would take a roster of the repo's tools.
 */
const plugin: Plugin = definePlugin({
  meta: { name: "comments" },
  rules: { "no-capitalized-identifier": noCapitalizedIdentifier },
});

export default plugin;
