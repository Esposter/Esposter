import type { Plugin, RolldownOptions, RolldownPluginOption } from "rolldown";

import { externalVueFramework, getRolldownConfigurationNode } from "@esposter/configuration";
// oxlint-disable-next-line typescript/ban-ts-comment, typescript/prefer-ts-expect-error
// @ts-ignore TS2321: Excessive stack depth
const rolldownConfigurationNode = getRolldownConfigurationNode();
const rolldownConfiguration: RolldownOptions = {
  ...rolldownConfigurationNode,
  external: [...externalVueFramework, "@azure/functions"],
  plugins: [
    (rolldownConfigurationNode.plugins as RolldownPluginOption[]).filter(
      (plugins) =>
        !(Array.isArray(plugins) && (plugins as Plugin[]).some(({ name }) => name.includes("rolldown-plugin-dts"))),
    ),
  ],
};

export default rolldownConfiguration;
