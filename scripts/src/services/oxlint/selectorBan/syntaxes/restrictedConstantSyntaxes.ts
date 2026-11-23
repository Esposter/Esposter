import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { TEST_FILE_PATTERNS, VUE_PACKAGES } from "#src/services/oxlint/selectorBan/constants";

// The moment a value is worth naming it is worth importing, so a fixed scalar or list sits in its feature's
// `constants.ts` and the next file that needs it finds it there, never at the top of a component or a composable
// (the file-organization skill, `references/constants.md`). The casing is what marks a fixed value, so the ban reads
// It off the name. It runs over components and `composables/`, the construct's own domain.
export const RESTRICTED_CONSTANT_SYNTAXES: SelectorBanList = {
  bans: [
    {
      message:
        "A fixed value belongs in its feature's `services/.../constants.ts`, never at the top of a component or a composable. See the file-organization skill.",
      selector:
        ":matches(Program, Program > ExportNamedDeclaration) > VariableDeclaration[kind='const'] > VariableDeclarator[id.name=/^[A-Z][0-9A-Z_]+$/]",
    },
  ],
  excludeFiles: [...TEST_FILE_PATTERNS, "**/*.d.ts"],
  files: [`${VUE_PACKAGES}/**/*.vue`, `${VUE_PACKAGES}/**/composables/**/*.ts`],
};
