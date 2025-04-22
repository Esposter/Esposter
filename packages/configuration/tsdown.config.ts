import type { UserConfig } from "tsdown";

import nodePolyfills from "@rolldown/plugin-node-polyfills";
import { defineConfig } from "tsdown";

export default defineConfig({
  dts: { resolve: ["type-fest"] },
  entry: "src/index.ts",
  // @ts-expect-error @TODO: auto-resolved tmr
  plugins: [nodePolyfills()],
  tsconfig: "tsconfig.build.json",
}) satisfies UserConfig;
