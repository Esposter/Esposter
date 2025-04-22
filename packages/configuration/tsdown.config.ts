import type { UserConfig } from "tsdown";

import nodePolyfills from "@rolldown/plugin-node-polyfills";
import { defineConfig } from "tsdown";
// https://github.com/microsoft/TypeScript/issues/13626
const config: UserConfig = defineConfig({
  dts: { resolve: ["type-fest"] },
  entry: "src/index.ts",
  // @ts-expect-error @TODO: auto-resolved tmr
  plugins: [nodePolyfills()],
  tsconfig: "tsconfig.build.json",
});

export default config;
