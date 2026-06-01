import type { RolldownOptions } from "rolldown";

import { dts } from "rolldown-plugin-dts";

import { external } from "./external/external";

export const getRolldownConfigurationBrowser = (): RolldownOptions => ({
  external,
  input: "src/index.ts",
  output: { dir: "dist", format: "es" },
  plugins: [dts({ tsconfig: "tsconfig.build.json", tsgo: true })],
  tsconfig: "tsconfig.build.json",
});
