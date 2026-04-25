import type { RolldownOptions } from "rolldown";

import { dts } from "rolldown-plugin-dts";

const rolldownConfiguration: RolldownOptions = {
  input: "src/index.ts",
  output: { dir: "dist", format: "es" },
  platform: "node",
  // @TODO: https://github.com/qmhc/unplugin-dts/issues/458
  plugins: [dts({ tsconfig: "tsconfig.build.json" })],
  tsconfig: "tsconfig.build.json",
};

export default rolldownConfiguration;
