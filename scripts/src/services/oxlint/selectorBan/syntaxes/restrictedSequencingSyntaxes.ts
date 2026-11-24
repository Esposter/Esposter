import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { VUE_PACKAGES } from "#src/services/oxlint/selectorBan/constants";

// A counter taken as a call's id orders that call's reads by hand: the newest id is the one that lands, which is a run
// Scope's job. `useRunScope`, and `executeQuery`'s `runScope`, key each run, abort the one before it and commit only
// The newest, so a counter is never how overlapping async work is ordered. The run scope is an app primitive, so the
// List is scoped to the app's own files, and a package with no run scope to name keeps its counters.
export const RESTRICTED_SEQUENCING_SYNTAXES: SelectorBanList = {
  bans: [
    {
      message:
        "Don't take a counter's value as a call's id to order overlapping reads — a run scope (`useRunScope`, or `executeQuery`'s `runScope`) keys each read and commits only the newest. See the vue-composable-patterns skill.",
      selector: "VariableDeclarator[init.type='UpdateExpression']",
    },
  ],
  excludeFiles: ["**/*.d.ts", "**/*.test.ts", "**/test/setup.ts"],
  files: [`${VUE_PACKAGES}/**/app/**/*.ts`, `${VUE_PACKAGES}/**/app/**/*.vue`],
};
