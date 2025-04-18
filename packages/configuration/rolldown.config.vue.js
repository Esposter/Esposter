import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig([
  {
    input: "src/index.ts",
    output: [{ dir: "dist", format: "es" }],
    plugins: [dts({ tsconfig: "tsconfig.build.vue.json" })],
    resolve: {
      tsconfigFilename: "tsconfig.build.vue.json",
    },
  },
]);
