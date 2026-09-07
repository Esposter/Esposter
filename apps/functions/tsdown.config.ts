import type { UserConfig } from "tsdown";

import { getPackagePatterns, getTsdownConfigurationNode, readPackageManifest } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

const HOST_PROVIDED_PACKAGES = ["@azure/functions"];
const { dependencies } = readPackageManifest();
// A deploy artifact rather than an installed package: the Functions host runs `dist/index.js` and installs
// Nothing, so every dependency is vendored except the host's own runtime API. Deriving the list from the
// Manifest vendors a newly added dependency without anyone remembering to, and `onlyImport` fails the build if a
// Chunk reaches for anything the host does not provide.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  deps: {
    alwaysBundle: getPackagePatterns(
      Object.keys(dependencies ?? {}).filter((name) => !HOST_PROVIDED_PACKAGES.includes(name)),
    ),
    neverBundle: getPackagePatterns(HOST_PROVIDED_PACKAGES),
    onlyImport: getPackagePatterns(HOST_PROVIDED_PACKAGES),
  },
  // The v4 model loads an app by reading "main" rather than resolving it, and generation removes any field it
  // Does not write. `legacy` hands the field to the build instead: with no CJS output the ESM chunk is written
  // Into "main". Pinned by `src/index.test.ts`, the only enforcer there is.
  exports: { legacy: true },
  // The host parses this at every cold start and no human reads it, so compression is worth the ~30% it takes
  // Off. `mangle` stays off, which is why this is spelled out rather than `minify: true`: it would take a
  // Further ~25% and rename every identifier, and a handler's stack is the only diagnosis available for an
  // EventGrid delivery that already happened.
  minify: { compress: true, mangle: false },
});

export default tsdownConfiguration;
