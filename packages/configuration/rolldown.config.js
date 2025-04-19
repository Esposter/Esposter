import nodePolyfills from "@rolldown/plugin-node-polyfills";
import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig([
  {
    input: "src/index.ts",
    output: [{ dir: "dist", format: "es" }],
    plugins: [nodePolyfills(), dts({ resolve: ["type-fest"], tsconfig: "tsconfig.build.json" })],
    resolve: {
      tsconfigFilename: "tsconfig.build.json",
    },
  },
]);
