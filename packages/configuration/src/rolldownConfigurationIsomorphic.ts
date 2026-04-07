import type { Plugin, RolldownOptions } from "rolldown";

import { rolldownConfigurationBrowser } from "@/rolldownConfigurationBrowser";
import nodePolyfills from "@rolldown/plugin-node-polyfills";

export const rolldownConfigurationIsomorphic: RolldownOptions = {
  ...rolldownConfigurationBrowser,
  plugins: [nodePolyfills(), ...(rolldownConfigurationBrowser.plugins as Plugin[])],
};
