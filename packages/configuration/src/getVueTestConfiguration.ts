import type { ViteUserConfig } from "vitest/config";

// Every worker runs Vue as the app ships it, with the Options API compiled out, so a component that needs it fails
// Its test rather than the app. The hook has to load before the environment first imports Vue, which only a Node flag
// Can do. It reaches every member, the app included, through the `test` options `getVitestConfiguration` builds
export const getVueTestConfiguration = (): NonNullable<ViteUserConfig["test"]> => ({
  execArgv: ["--import", import.meta.resolve("@esposter/configuration/vitest/registerVueEsmBundler.js")],
});
