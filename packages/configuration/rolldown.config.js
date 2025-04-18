import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig([
  {
    input: "src/index.ts",
    output: [{ dir: "dist", format: "es" }],
    plugins: [dts({ tsconfig: "tsconfig.build.json" })],
    resolve: {
      tsconfigFilename: "tsconfig.build.json",
    },
  },
]);
