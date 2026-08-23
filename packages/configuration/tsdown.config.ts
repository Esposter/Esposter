import type { UserConfig } from "tsdown";

import { mergeConfig } from "tsdown";

import { getTsdownConfigurationNode } from "./src/getTsdownConfigurationNode.ts";
// The bootstrap package, and the three ways it differs all follow from that.
//
// Its relative imports carry a `.ts` extension, which no other package needs. tsdown loads a config with a
// Native import: every other package resolves this one as a built `.js` file, while this config is the one
// That has to reach TypeScript source before any build has run, and the native loader will not guess an
// Extension. `getVitestConfiguration` carries the same extensions for the same reason on the Vite side.
//
// It also externalizes everything, `devDependencies` included. It is private and never published, and its
// Dist imports nothing but build tooling every workspace member already has installed — so vendoring
// `unplugin-vue` and friends would only duplicate what is already on disk beside it.
// And its `eslint/` tree is published surface that no bundle produces. Generating an `exports` field is what
// Encapsulates a package, so without this every `@esposter/configuration/eslint/*.js` import — the shared flat
// Config each package symlinks — resolves to nothing.
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationNode(), {
  deps: { neverBundle: true },
  exports: { customExports: { "./eslint/*": "./eslint/*" } },
});

export default tsdownConfiguration;
