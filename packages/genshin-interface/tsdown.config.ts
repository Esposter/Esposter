import type { UserConfig } from "tsdown";

import { getTsdownConfigurationVue } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// A condition map resolves in its key order, so the source arm comes first, as devExports writes it
// eslint-disable-next-line perfectionist/sort-objects -- the source arm must resolve before the default
const DEV_STYLES_EXPORT = { source: "./src/styles/*.css", default: "./dist/styles/*.css" };
// `constants` is the interface's pure constants, which the scripts read without its components
// `save` is the save's own entry, which the app's server loads for the wish counters' kinds without the interface's components
// The stylesheets a component shares with a package built on this one. `genshin-world`'s Mail screen takes the
// Confirm dialog's rule through `./styles/*.css`, so each stylesheet is copied beside the build and exported
// Under its own name
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationVue(), {
  copy: { from: "src/styles/*.css", to: "dist/styles" },
  entry: {
    constants: "src/services/constants.ts",
    getFixtureImageName: "src/services/getFixtureImageName.ts",
    index: "src/index.ts",
    save: "src/save.ts",
  },
  exports: {
    customExports: (exports, { isPublish }) => ({
      ...exports,
      "./styles/*.css": isPublish ? "./dist/styles/*.css" : DEV_STYLES_EXPORT,
    }),
  },
});

export default tsdownConfiguration;
