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
  // Nothing here is read by a human, so the artifact the host downloads is compressed: 7.25 MB to 5.00 MB.
  // `mangle` stays off, which is the whole reason this is spelled out rather than `minify: true`. Mangling
  // Takes it to 3.67 MB and renames every identifier, so a thrown error's stack names `t` instead of the
  // Handler — and a handler's stack is the only diagnosis available for an EventGrid delivery that already
  // Happened. `dce-only` was measured too and changes nothing: rolldown already tree-shakes.
  minify: { compress: true, mangle: false, removeWhitespace: true },
});

export default tsdownConfiguration;
