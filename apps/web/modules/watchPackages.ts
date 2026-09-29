import type { ChildProcess } from "node:child_process";

import { defineNuxtModule } from "nuxt/kit";
import { spawn, spawnSync } from "node:child_process";
import { globSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const CONFIGURATION_PACKAGE_NAME = "configuration";
// The app runs every workspace package from its `dist`, so under `nuxt dev` each package's tsdown watches its source
// And a package edit reaches the page as a reload. Each watcher is a plain `node` child of this process rather than a
// `pnpm exec`, so Ctrl+C stops them all with Nuxt instead of every Windows `.cmd` shim asking to terminate its batch
// Job. The configuration package is built once first and never watched: every other package's `tsdown.config.ts`
// Imports its `dist`, which its own watcher would clean from under them
export default defineNuxtModule({
  meta: { name: "watch-packages" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev || process.env.VITEST) return;
    const packagesDirectory = join(nuxt.options.workspaceDir, "packages");
    const configurationDirectory = join(packagesDirectory, CONFIGURATION_PACKAGE_NAME);
    const tsdownPath = createRequire(join(configurationDirectory, "package.json")).resolve("tsdown/run");
    spawnSync(process.execPath, [tsdownPath], { cwd: configurationDirectory, stdio: "inherit" });
    const watchers: ChildProcess[] = globSync("*/tsdown.config.ts", { cwd: packagesDirectory })
      .map((path) => join(packagesDirectory, dirname(path)))
      .filter((packageDirectory) => packageDirectory !== configurationDirectory)
      .map((packageDirectory) =>
        spawn(process.execPath, [tsdownPath, "--watch"], { cwd: packageDirectory, stdio: "inherit" }),
      );
    nuxt.hook("close", () => {
      for (const watcher of watchers) watcher.kill();
    });
  },
});
