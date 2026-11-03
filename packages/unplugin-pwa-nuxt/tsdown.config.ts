import type { UserConfig } from "tsdown";

import { getTsdownConfigurationNuxtModule } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// The module writes the client plugin's path into a template and the app imports the types from the package root, so
// No runtime file needs an `exports` arm. The types of the denylist's virtual module are a declaration file no build
// Writes, so its arm is named here
const tsdownConfiguration: UserConfig = mergeConfig(
  getTsdownConfigurationNuxtModule([
    "runtime/constants",
    "runtime/createPwaPlugin",
    "runtime/models/Pwa",
    "runtime/models/UseRegisterSW",
  ]),
  { exports: { customExports: { "./navigation-denylist": { types: "./navigation-denylist.d.ts" } } } },
);

export default tsdownConfiguration;
