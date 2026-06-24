import type { PluginOption } from "vite";

// CodSpeed instruments `bench()` for its hosted dashboard, wired only under the CodSpeed CI runner
// (`CODSPEED_ENV` is set by `CodSpeedHQ/action`). The import is lazy so packages that never bench don't
// need the plugin installed and local runs never load it. Vitest accepts `Promise<Plugin>` plugin entries.
export const getBenchmarkPlugins = (): PluginOption[] =>
  process.env.CODSPEED_ENV === undefined
    ? []
    : [import("@codspeed/vitest-plugin").then(({ default: codspeedPlugin }) => codspeedPlugin())];
