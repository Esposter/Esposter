import type { Plugin } from "vite";

import { mountRegionData } from "#parity/mountRegionData";

export const regionDataPlugin: Plugin = {
  apply: "serve",
  configurePreviewServer: mountRegionData,
  configureServer: mountRegionData,
  name: "region-data",
};
