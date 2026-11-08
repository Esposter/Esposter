import type { UserConfig } from "tsdown";

import { getTsdownConfigurationVue } from "@esposter/configuration";
import { mergeConfig } from "tsdown";

// The stylesheets another package's `<style src>` names. The rest are read from this package's own source by its own
// Components, which compile them into each component's stylesheet, so they are neither copied nor exported
const SHARED_STYLE_NAMES = ["confirmDialog", "creamPill", "creamPillButton", "ringButton", "rowTint", "shopScreen"];
// `constants` is the interface's pure constants, which the scripts read without its components
// `save` is the save's own entry, which the app's server loads for the wish counters' kinds without the interface's components
// The stylesheets a component shares with a package built on this one. `genshin-world`'s Mail screen takes the
// Confirm dialog's rule through `./styles/<name>.css`, so each is copied beside the build and exported under its own name
const tsdownConfiguration: UserConfig = mergeConfig(getTsdownConfigurationVue(), {
  copy: SHARED_STYLE_NAMES.map((name) => ({ from: `src/styles/${name}.css`, to: "dist/styles" })),
  entry: {
    constants: "src/services/constants.ts",
    getFixtureImageName: "src/services/getFixtureImageName.ts",
    index: "src/index.ts",
    save: "src/save.ts",
  },
  exports: {
    customExports: (exports, { isPublish }) => ({
      ...exports,
      ...Object.fromEntries(
        SHARED_STYLE_NAMES.map((name) => {
          const distStyle = `./dist/styles/${name}.css`;
          // A condition map resolves in its key order, so the source arm comes first, as devExports writes it
          // eslint-disable-next-line perfectionist/sort-objects -- the source arm must resolve before the default
          const devStyle = { source: `./src/styles/${name}.css`, default: distStyle };
          return [`./styles/${name}.css`, isPublish ? distStyle : devStyle];
        }),
      ),
    }),
  },
});

export default tsdownConfiguration;
