import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { TEST_FILE_PATTERNS, VUE_PACKAGES } from "#src/services/oxlint/selectorBan/constants";

// The Nuxt app's own SFCs and composables, which is where `useAutofocus` is auto-imported: a game package that shares
// This config focuses its own screens as they open and has no text entry for a reader to be typing in, so it is out of
// Scope by where the composable exists rather than by a list of paths. A `.focus()` after an action — a move, a close,
// An error — is the keyboard following the reader, and is not inside `onMounted`.
export const RESTRICTED_FOCUS_SYNTAXES: SelectorBanList = {
  bans: [
    {
      // A Tiptap chain's `.focus()` is a command, not the element's focus, however many commands run before it
      message:
        "Don't focus an element in `onMounted`. Give a library component `is-autofocus`, or call `useAutofocus(element)`, which leaves a reader typing elsewhere alone. See the ui-library skill's fields page.",
      selector:
        "CallExpression[callee.name='onMounted'] CallExpression[callee.property.name='focus']:not(:has(CallExpression[callee.property.name='chain']))",
    },
  ],
  excludeFiles: [...TEST_FILE_PATTERNS, "**/*.d.ts"],
  files: [`${VUE_PACKAGES}/**/app/**/*.vue`, `${VUE_PACKAGES}/**/app/composables/**/*.ts`],
};
