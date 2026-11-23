import type { UserConfig } from "tsdown";

import { getPackagePatterns } from "#src/services/getPackagePatterns";
import { getTsdownConfigurationNode } from "#src/services/getTsdownConfigurationNode";
import { readPackageManifest } from "#src/services/readPackageManifest";
import { mergeConfig } from "tsdown";

const { devDependencies } = readPackageManifest();
// The bootstrap package: private, never published, and its dist imports nothing but its own `devDependencies`, so
// Everything stays external, `devDependencies` included.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  // The base derives `onlyImport` from the manifest's runtime dependency fields, and this package declares none,
  // So the gate would reject every import it makes. `mergeConfig` replaces a colliding array outright rather
  // Than merging it — `plugins` is the one exception — so the whole list is stated here.
  deps: { neverBundle: true, onlyImport: getPackagePatterns(Object.keys(devDependencies ?? {})) },
  // The constants are an entry of their own, so every one of them stays in the subpath's build. A module only the
  // Subpath names is otherwise left with the names the package itself uses, which drops the rest from the file
  entry: { constants: "src/services/constants.ts", index: "src/index.ts" },
  // The `oxfmt/`, `types/` and `vitest/` trees are published surface no bundle produces, and generating an
  // `exports` field is what encapsulates a package: without these, every `@esposter/configuration/oxfmt`
  // import — the formatter's settings the root config and every
  // Generator read, the app's `types/global.d.ts` import and the Vue hook every Vitest worker imports all resolve to
  // Nothing. The formatter's and the generator's are raw TypeScript Node strips, so they resolve before this package
  // Built. Every project under `packages/` picks the augmentation up Through `tsconfig.base.json`'s own `include`;
  // The app is the one consumer outside that tree, and a specifier is the only way it can name the file without
  // Counting directories, so that file is the only one exported.
  exports: {
    customExports: {
      // The constants alone, for a script that needs one and would otherwise load every build and test helper the root
      // Barrel imports — most of a tooling script's startup
      "./constants": { default: "./dist/constants.js", source: "./src/services/constants.ts" },
      "./generate-barrels": "./src/services/generateBarrels.ts",
      "./generate-exports": "./src/services/generateExports.ts",
      "./oxfmt": "./oxfmt/oxfmtConfiguration.ts",
      "./read-exports-generation": "./src/services/readExportsGeneration.ts",
      "./types/global.d.ts": "./types/global.d.ts",
      "./vitest/*": "./vitest/*",
    },
  },
});

export default tsdownConfiguration;
