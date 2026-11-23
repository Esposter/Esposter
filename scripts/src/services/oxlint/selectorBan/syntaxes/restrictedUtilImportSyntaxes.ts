import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { TEST_FILE_PATTERNS } from "#src/services/oxlint/selectorBan/constants";

// `util/` holds dependency-free universals — math, strings, regexes, engine extensions — and a helper that imports a
// Third-party package belongs in `services/` (`file-organization`, `references/layer-placement.md`). A package name
// Opens with a letter or a scope, where an alias opens with `@/`, `@@/` or `#` and a relative path with a dot, so the
// Packages are the sources matched, the runtime's `node:` modules and the workspace's `@esposter/*` packages aside. A
// Type-only import or re-export stays, since a type is not a dependency, and tests are exempt, since a suite's imports
// Are the runner's
const PACKAGE_SOURCE = String.raw`[source.value=/^(?:[a-z]|@[a-z])/]:not([source.value=/^(?:node:|@esposter\/)/])`;
const MESSAGE =
  "A `util/` file imports no third-party package — move the helper to `services/`, where a dependency is what earns the folder. See the file-organization skill.";

export const RESTRICTED_UTIL_IMPORT_SYNTAXES: SelectorBanList = {
  bans: [
    {
      message: MESSAGE,
      selector: `ImportDeclaration[importKind='value']${PACKAGE_SOURCE}:matches(:not(:has(> :matches(ImportDefaultSpecifier, ImportNamespaceSpecifier, ImportSpecifier))), :has(> ImportDefaultSpecifier, > ImportNamespaceSpecifier, > ImportSpecifier[importKind='value']))`,
    },
    {
      message: MESSAGE,
      selector: `:matches(ExportAllDeclaration, ExportNamedDeclaration)[exportKind='value']${PACKAGE_SOURCE}`,
    },
  ],
  excludeFiles: TEST_FILE_PATTERNS,
  files: ["**/util/**/*.ts"],
};
