import type { ConfigExport, Plugin } from "rolldown";

import rolldownConfigurationBase from "@esposter/configuration/rolldown.config.base.js";
import nodePolyfills from "@rolldown/plugin-node-polyfills";
import { defineConfig } from "rolldown";

const rolldownConfiguration: ConfigExport = defineConfig([
  {
    ...rolldownConfigurationBase,
    plugins: [nodePolyfills(), ...(rolldownConfigurationBase.plugins as Plugin[])],
  },
]);

export default rolldownConfiguration;
