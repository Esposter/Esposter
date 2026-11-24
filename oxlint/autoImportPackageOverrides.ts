import type { OxlintOverride } from "oxlint";

import { PACKAGE_IMPORT_PATTERNS, RESTRICTED_IMPORT_PATHS } from "#oxlint/importRestrictions";
import { getAutoImportedPaths } from "#oxlint/services/getAutoImportedPaths";
import { existsSync, readdirSync } from "node:fs";

// A package that builds with the shared Vue plugin has its own `auto-imports.d.ts`, committed beside its manifest, so
// The packages are the ones that have one. The plugin's imports are ambient in its components. Its `.ts` files are left
// Out: a unit suite runs under the plain Vitest configuration, which applies no plugin, so a module it loads keeps the
// Imports it needs there. A type import stays allowed: the declaration build writes a prop, slot or emit type into the
// Shipped `.d.ts` only through an import, and an ambient name there fails it as a private name (`TS4033`)
export const AUTO_IMPORT_PACKAGE_OVERRIDES: OxlintOverride[] = readdirSync(new URL("../packages/", import.meta.url))
  .filter((name) => existsSync(new URL(`../packages/${name}/auto-imports.d.ts`, import.meta.url)))
  .map((name) => ({
    files: [`packages/${name}/**/*.vue`],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            ...RESTRICTED_IMPORT_PATHS,
            ...getAutoImportedPaths(`packages/${name}/auto-imports.d.ts`, "The package's Vue plugin", true),
          ],
          patterns: PACKAGE_IMPORT_PATTERNS,
        },
      ],
    },
  }));
