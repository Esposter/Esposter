import type { UserConfig } from "tsdown";

import { getPackagePatterns, getTsdownConfigurationNode, readPackageManifest } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

const HOST_PROVIDED_PACKAGES = ["@azure/functions"];
const { dependencies } = readPackageManifest();
// A deploy artifact, not a package anyone installs: the Functions host runs `dist/index.js` and installs
// Nothing, so every dependency is vendored rather than externalized. The list is derived from the manifest so
// A newly added dependency is vendored without anyone remembering to add it here, and `onlyImport` fails the
// Build if a chunk reaches for anything the host does not itself provide.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  deps: {
    alwaysBundle: getPackagePatterns(
      Object.keys(dependencies ?? {}).filter((name) => !HOST_PROVIDED_PACKAGES.includes(name)),
    ),
    neverBundle: getPackagePatterns(HOST_PROVIDED_PACKAGES),
    onlyImport: getPackagePatterns(HOST_PROVIDED_PACKAGES),
  },
  // No generated exports map, and this is the one package where that matters: the Functions host loads the
  // App by reading "main" from this manifest, and tsdown's exports generation rewrites the entry fields on every
  // Build — which is how "main" silently disappeared here once, registering zero functions on a host that still
  // Reported Running. Nothing resolves this package as a dependency, so an exports map buys it nothing, and
  // Leaving the manifest alone is what keeps the host's own contract in it
  exports: false,
  // Nothing here is read by a human, so the artifact the host downloads is compressed: 7.25 MB to 5.00 MB.
  // `mangle` stays off, which is the whole reason this is spelled out rather than `minify: true`. Mangling
  // Takes it to 3.67 MB and renames every identifier, so a thrown error's stack names `t` instead of the
  // Handler — and a handler's stack is the only diagnosis available for an EventGrid delivery that already
  // Happened. `dce-only` was measured too and changes nothing: rolldown already tree-shakes, and whitespace
  // Removal is `codegen.removeWhitespace`, which is on by default and so is not restated here.
  minify: { compress: true, mangle: false },
});

export default tsdownConfiguration;
