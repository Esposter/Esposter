import type { ConfigExport } from "rolldown";

import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

const rolldownConfiguration: ConfigExport = defineConfig([
  {
    input: "src/index.ts",
    output: [{ dir: "dist", format: "es" }],
    plugins: [dts({ resolve: ["type-fest"], tsconfig: "tsconfig.build.json" })],
    resolve: {
      tsconfigFilename: "tsconfig.build.json",
    },
  },
]);

export default rolldownConfiguration;
