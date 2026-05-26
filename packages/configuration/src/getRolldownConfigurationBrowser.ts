import type { RolldownOptions } from "rolldown";

import { dts } from "rolldown-plugin-dts";

import { external } from "./external/external";

export const getRolldownConfigurationBrowser = (): RolldownOptions => ({
  external,
  input: "src/index.ts",
  output: { dir: "dist", format: "es" },
  // @TODO: https://github.com/qmhc/unplugin-dts/issues/458
  plugins: [dts({ tsconfig: "tsconfig.build.json" })],
  tsconfig: "tsconfig.build.json",
});
