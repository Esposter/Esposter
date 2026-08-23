import type { UserConfig } from "tsdown";

import { getPackagePatterns, getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Vendored rather than externalized, against the default. `link-preview-js` is CJS whose entry is a barrel
// Whose whole body re-exports its real entry through an extensionless relative `require`, and a bundler that
// Inlines that barrel emits the re-export as a path Node cannot resolve — the failure surfaces in a consumer,
// At its first request, naming a file inside this package's dependency that the consumer never imported.
// Vendoring settles it here, where the dependency is chosen, instead of leaving every downstream bundler to
// Interop with it. The dependency stays in `dependencies`: what a bundle swallows is a build decision, and
// `inlinedDependencies` is where the build records it.
const BUNDLED_PACKAGES = ["link-preview-js"];
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  deps: { alwaysBundle: getPackagePatterns(BUNDLED_PACKAGES) },
});

export default tsdownConfiguration;
