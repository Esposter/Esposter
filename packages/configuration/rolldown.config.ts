import type { ConfigExport } from "rolldown";

import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

const rolldownConfiguration: ConfigExport = defineConfig([
  {
    external: ["@esposter/db-schema"],
    input: "src/index.ts",
    output: { dir: "dist", format: "es" },
    plugins: [
      dts({
        resolve: ["type-fest"],
        tsconfig: "tsconfig.build.json",
      }),
    ],
    tsconfig: "tsconfig.build.json",
  },
]);

export default rolldownConfiguration;
