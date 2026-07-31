import type { RolldownOptions } from "rolldown";

import { dts } from "rolldown-plugin-dts";

import { external } from "./external/external";

export const getRolldownConfigurationBrowser = (): RolldownOptions => ({
  // Disable rolldown's `//#region <module-path>` debug banners (default `"simple"`). Their embedded
  // Paths depend on the install layout (pnpm symlinked `.pnpm` store vs virrun copy-mode sandbox), so
  // They make the bundle non-reproducible across build environments and clutter `.d.ts` hover tooltips.
  // → https://github.com/rolldown/rolldown/issues/9006
  experimental: { attachDebugInfo: "none" },
  external,
  input: "src/index.ts",
  output: { dir: "dist", format: "es" },
  plugins: [dts({ tsconfig: "tsconfig.build.json" })],
  tsconfig: "tsconfig.build.json",
});
