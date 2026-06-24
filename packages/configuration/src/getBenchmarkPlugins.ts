import type { Plugin } from "vite";

import codspeedPlugin from "@codspeed/vitest-plugin";

// CodSpeed's plugin instruments `bench()` for the hosted dashboard (CPU/cache simulation, walltime, memory
// + flamegraphs). It is only wired when the CodSpeed runner drives the run — `CODSPEED_ENV` is set by
// `CodSpeedHQ/action` in CI — so local `pnpm bench` stays the plain tinybench path that the colocated
// Reporter renders into the committed `*.bench.md`. Gating the import this way keeps the plugin's bench-mode
// Side effects (forks pool, profiling v8 flags, globalSetup) out of local runs. Shared so both
// `getVitestConfiguration` (most packages) and the app's `defineVitestProject` config wire it identically.
// `@codspeed/vitest-plugin` is a `peerDependency` of this package (it's in the shared external list, and the
// Critical rule is external imports are peerDependencies, never deps/devDeps — see the external list: the
// Plugin loads sibling runtime files + native prebuilds via __dirname and can't be bundled). Every package
// That runs `pnpm bench` under CodSpeed (app, virrun) installs it as a devDependency so it resolves there.
export const getBenchmarkPlugins = (): Plugin[] => (process.env.CODSPEED_ENV === undefined ? [] : [codspeedPlugin()]);
