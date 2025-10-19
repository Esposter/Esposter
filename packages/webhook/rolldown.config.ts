import type { ConfigExport, Plugin, RolldownPluginOption } from "rolldown";

import rolldownConfigurationBase from "@esposter/configuration/rolldown.config.base.js";
import { defineConfig } from "rolldown";

const rolldownConfiguration: ConfigExport = defineConfig([
  {
    ...rolldownConfigurationBase,
    external: [],
    platform: "node",
    plugins: [
      (rolldownConfigurationBase.plugins as RolldownPluginOption[]).filter(
        (plugins) =>
          !(Array.isArray(plugins) && (plugins as Plugin[]).some(({ name }) => name.includes("rolldown-plugin-dts"))),
      ),
    ],
  },
]);

export default rolldownConfiguration;
