import type { UserConfig } from "tsdown";

import { getPackagePatterns, getTsdownConfigurationNode, readPackageManifest } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

const HOST_PROVIDED_PACKAGES = ["@azure/functions"];
const { dependencies } = readPackageManifest();
// A deploy artifact, not a package anyone installs: the Functions host runs `dist/index.js` and installs
// Nothing, so every dependency is vendored rather than externalized. The list is derived from the manifest so
// A newly added dependency is vendored without anyone remembering to add it here, and `onlyImport` fails the
// Build if a chunk reaches for anything the host does not itself provide.
//
// No declarations: nothing consumes this package as a library, so generating them would only cost build time.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  deps: {
    alwaysBundle: getPackagePatterns(
      Object.keys(dependencies ?? {}).filter((name) => !HOST_PROVIDED_PACKAGES.includes(name)),
    ),
    neverBundle: getPackagePatterns(HOST_PROVIDED_PACKAGES),
    onlyImport: getPackagePatterns(HOST_PROVIDED_PACKAGES),
  },
  dts: false,
});

export default tsdownConfiguration;
