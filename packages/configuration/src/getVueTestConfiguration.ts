import type { ViteUserConfig } from "vitest/config";
// Every worker runs Vue as the app ships it, with the Options API compiled out, so a component that needs it fails
// Its test rather than the app. The hook has to load before the environment first imports Vue, which only a Node flag
// Can do. The app builds its Vitest config without `getVitestConfiguration`, so it spreads this as it does the bench
// Wiring
export const getVueTestConfiguration = (): NonNullable<ViteUserConfig["test"]> => ({
  execArgv: ["--import", import.meta.resolve("@esposter/configuration/vitest/registerVueEsmBundler.js")],
});
