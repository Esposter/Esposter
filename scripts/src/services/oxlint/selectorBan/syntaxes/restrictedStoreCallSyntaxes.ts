import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { TEST_FILE_PATTERNS, VUE_PACKAGES } from "#src/services/oxlint/selectorBan/constants";

// The store's own source (`app/store`, not its tests) reads a nested store's refs by dot, which
// `restrictedStoreSyntaxes.js` bans everywhere else. What it may not do is call a nested store's method by dot: the
// Method is destructured at the setup root, so the call names the action rather than the store holding it. A call's
// Callee is the only dot the rule can read as a method, since a ref is never called.
export const RESTRICTED_STORE_CALL_SYNTAXES: SelectorBanList = {
  bans: [
    {
      message:
        "Destructure a nested store's methods at the setup root and call them by name — a store's source reads its refs by dot, never calls its methods. See the pinia skill.",
      selector: "CallExpression[callee.object.name=/^[a-z][A-Za-z0-9]*Store$/]",
    },
  ],
  excludeFiles: [...TEST_FILE_PATTERNS, "**/*.d.ts", "**/test/setup.ts"],
  files: [`${VUE_PACKAGES}/**/app/store/**/*.ts`],
};
