import type { UserConfig } from "tsdown";

import { getPackagePatterns } from "#src/getPackagePatterns";
import { getTsdownConfigurationNode } from "#src/getTsdownConfigurationNode";
import { readPackageManifest } from "#src/readPackageManifest";
import { mergeConfig } from "tsdown";

const { devDependencies } = readPackageManifest();
// The bootstrap package: private, never published, and its dist imports nothing but build tooling every
// Workspace member already has installed, so everything stays external, `devDependencies` included.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  // The base derives `onlyImport` from the manifest's runtime dependency fields, and this package declares none,
  // So the gate would reject every import it makes. `mergeConfig` replaces a colliding array outright rather
  // Than merging it — `plugins` is the one exception — so the whole list is stated here.
  deps: { neverBundle: true, onlyImport: getPackagePatterns(Object.keys(devDependencies ?? {})) },
  // The `eslint/` and `types/` trees are published surface no bundle produces, and generating an `exports` field
  // Is what encapsulates a package: without these, every `@esposter/configuration/eslint/*.js` import — the shared
  // Flat config each package symlinks — and the app's `types/global.d.ts` import resolve to nothing. Every project
  // Under `packages/` picks the augmentation up through `tsconfig.base.json`'s own `include`; the app is the one
  // Consumer outside that tree, and a specifier is the only way it can name the file without counting directories.
  exports: { customExports: { "./eslint/*": "./eslint/*", "./types/*": "./types/*" } },
});

export default tsdownConfiguration;
