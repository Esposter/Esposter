import type { Plugin, RolldownOptions } from "rolldown";

import nodePolyfills from "@rolldown/plugin-node-polyfills";

import { rolldownConfigurationBrowser } from "./rolldownConfigurationBrowser";

export const rolldownConfigurationIsomorphic: RolldownOptions = {
  ...rolldownConfigurationBrowser,
  plugins: [nodePolyfills(), ...(rolldownConfigurationBrowser.plugins as Plugin[])],
};
