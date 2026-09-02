import type { UserConfig } from "tsdown";

import { getPackagePatterns, getTsdownConfigurationNode } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// Vendored against the default: `link-preview-js` is CJS whose entry barrel re-exports its real entry through an
// Extensionless relative `require`, which a bundler that inlines the barrel emits as a path Node cannot resolve
// — the failure lands in a consumer, at its first request, naming a file it never imported. Settled here, where
// The dependency is chosen. It stays in `dependencies`; `inlinedDependencies` records what the bundle swallowed.
const BUNDLED_PACKAGES = ["link-preview-js"];
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  deps: { alwaysBundle: getPackagePatterns(BUNDLED_PACKAGES) },
});

export default tsdownConfiguration;
