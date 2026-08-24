import type { UserConfig } from "tsdown";

import { getPackagePatterns } from "#src/getPackagePatterns";
import { getTsdownConfigurationNode } from "#src/getTsdownConfigurationNode";
import { readPackageManifest } from "#src/readPackageManifest";
import { mergeConfig } from "tsdown";

const { devDependencies } = readPackageManifest();
// The bootstrap package, and the two ways it differs both follow from that.
//
// It externalizes everything, `devDependencies` included. It is private and never published, and its
// Dist imports nothing but build tooling every workspace member already has installed — so vendoring
// `unplugin-vue` and friends would only duplicate what is already on disk beside it.
// And its `eslint/` tree is published surface that no bundle produces. Generating an `exports` field is what
// Encapsulates a package, so without this every `@esposter/configuration/eslint/*.js` import — the shared flat
// Config each package symlinks — resolves to nothing.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  // The base derives `onlyImport` from the manifest's runtime dependency fields, which this package has none
  // Of — everything it externalizes is a `devDependency`, so the allowlist has to be widened by exactly that
  // Set or the gate would fail every import it makes. `mergeConfig` concatenates the two lists.
  deps: { neverBundle: true, onlyImport: getPackagePatterns(Object.keys(devDependencies ?? {})) },
  exports: { customExports: { "./eslint/*": "./eslint/*" } },
});

export default tsdownConfiguration;
