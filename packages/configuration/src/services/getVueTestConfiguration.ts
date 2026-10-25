import type { ViteUserConfig } from "vitest/config";

// Logs a dependency prints on every run and no test can act on: `@nuxt/test-utils` always hands Vue Test Utils a
// `mocks` object, empty or not, which makes it install a mixin the Options-API-off build refuses, and its own filter
// For Vue's Suspense notice patches a console Vitest has already replaced. Each is matched by its fixed opening text
const UPSTREAM_VUE_LOGS = [
  "[Vue warn]: Mixins are only available in builds supporting Options API",
  "<Suspense> is an experimental feature and its API will likely change.",
];

// Every worker runs Vue as the app ships it, with the Options API compiled out, so a component that needs it fails
// Its test rather than the app. The hook has to load before the environment first imports Vue, which only a Node flag
// Can do. It reaches every member, the app included, through the `test` options `getVitestConfiguration` builds
export const getVueTestConfiguration = (): Required<
  Pick<NonNullable<ViteUserConfig["test"]>, "execArgv" | "onConsoleLog">
> => ({
  execArgv: ["--import", import.meta.resolve("@esposter/configuration/vitest/registerVueEsmBundler.js")],
  onConsoleLog: (log) => !UPSTREAM_VUE_LOGS.some((upstreamLog) => log.startsWith(upstreamLog)),
});
