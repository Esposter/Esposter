import type { Plugin, RolldownOptions } from "rolldown";

import nodePolyfills from "@rolldown/plugin-node-polyfills";

import { getRolldownConfigurationBrowser } from "./getRolldownConfigurationBrowser";

export const getRolldownConfigurationIsomorphic = (): RolldownOptions => {
  const rolldownConfigurationBrowser = getRolldownConfigurationBrowser();
  return {
    ...rolldownConfigurationBrowser,
    plugins: [nodePolyfills(), ...(rolldownConfigurationBrowser.plugins as Plugin[])],
  };
};
