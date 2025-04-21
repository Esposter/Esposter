import nodePolyfills from "@rolldown/plugin-node-polyfills";
import { defineConfig } from "tsdown";

export default defineConfig({
  dts: { resolve: ["type-fest"] },
  entry: "src/index.ts",
  plugins: [nodePolyfills()],
  tsconfig: "tsconfig.build.json",
});
