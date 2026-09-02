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
  // The `eslint/` tree is published surface no bundle produces, and generating an `exports` field is what
  // Encapsulates a package: without this, every `@esposter/configuration/eslint/*.js` import — the shared flat
  // Config each package symlinks — resolves to nothing.
  exports: { customExports: { "./eslint/*": "./eslint/*" } },
});

export default tsdownConfiguration;
