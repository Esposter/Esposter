import type { Plugin, RolldownOptions, RolldownPluginOption } from "rolldown";

import { rolldownConfigurationNode } from "@esposter/configuration";
// @ts-ignore TS2321: Excessive stack depth
const rolldownConfiguration: RolldownOptions = {
  ...rolldownConfigurationNode,
  external: [],
  plugins: [
    (rolldownConfigurationNode.plugins as RolldownPluginOption[]).filter(
      (plugins) =>
        !(Array.isArray(plugins) && (plugins as Plugin[]).some(({ name }) => name.includes("rolldown-plugin-dts"))),
    ),
  ],
};

export default rolldownConfiguration;
