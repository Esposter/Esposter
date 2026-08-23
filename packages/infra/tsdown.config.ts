import type { UserConfig } from "tsdown";

import { getPackagePatterns, getTsdownConfigurationNode, readPackageManifest } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

const { dependencies } = readPackageManifest();
// Pulumi runs `dist/index.js` with plain Node, which makes this a program rather than a library, so its
// Workspace siblings are vendored instead of left as imports. They export TypeScript source to workspace
// Consumers (`exports.devExports`), and Node's own ESM loader resolves no extensionless specifier and strips
// No enum — so an externalized sibling is a `pulumi preview` that dies on the first import. The `@pulumi/*`
// SDKs stay peers: the engine hands the program its own instance, and a vendored copy would not be it.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  deps: { alwaysBundle: getPackagePatterns(Object.keys(dependencies ?? {})) },
});

export default tsdownConfiguration;
