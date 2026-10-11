import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { defineNuxtModule, useLogger } from "nuxt/kit";

const BUILD_CACHE_SCRIPT_PATH = ".agents/skills/throughput/scripts/build-cached.sh";
const logger = useLogger("build-packages");

// Under `nuxt dev` the app's workspace packages are brought up to date once, at start, through the build cache, and no
// Tsdown watcher runs: every package edit by any session sharing the checkout used to rebuild and reload the page, and
// Competed with the agents for CPU and memory. A start with nothing changed restores every `dist` instantly, and a
// Package edit reaches the page on the next start.
export default defineNuxtModule({
  meta: { name: "build-packages" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev || process.env.VITEST) return;
    const build = spawnSync("bash", [join(nuxt.options.workspaceDir, BUILD_CACHE_SCRIPT_PATH), nuxt.options.rootDir], {
      stdio: "inherit",
    });
    if (build.status !== 0)
      logger.error(
        `A workspace package failed to build, see the failure with \`bash ${BUILD_CACHE_SCRIPT_PATH} apps/web\``,
      );
  },
});
