import { spawn } from "node:child_process";
import { relative, sep } from "node:path";
import { defineNuxtModule, useLogger } from "nuxt/kit";

const BUILD_CACHE_SCRIPT_PATH = ".agents/skills/throughput/scripts/build-cached.sh";
const logger = useLogger("build-packages");

// Under `nuxt dev` the app's workspace packages are brought up to date once, at start, through the build cache.
// No tsdown watcher runs: every package edit by any session sharing the checkout used to rebuild and reload the page.
// That competed with the agents for CPU and memory.
// A start with nothing changed restores every `dist` instantly, and a package edit reaches the page on the next start.
// The build starts in `setup` and is awaited at `build:before`, so it overlaps Nuxt's own app preparation.
// A failed build is logged and does not stop Nuxt. Bash runs from the workspace root with both paths relative and
// Forward-slashed, since bash on Windows reads a backslash in an argument as an escape.
export default defineNuxtModule({
  meta: { name: "build-packages" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev || process.env.VITEST) return;
    const packageDirectory = relative(nuxt.options.workspaceDir, nuxt.options.rootDir).split(sep).join("/");
    const build = spawn("bash", [BUILD_CACHE_SCRIPT_PATH, packageDirectory], {
      cwd: nuxt.options.workspaceDir,
      stdio: "inherit",
    });
    const buildDone = new Promise<void>((resolve) => {
      build.on("error", (error) => {
        logger.error(`The package build could not start: ${error.message}`);
        resolve();
      });
      build.on("close", (code) => {
        if (code !== 0)
          logger.error(
            `A workspace package failed to build, see the failure with \`bash ${BUILD_CACHE_SCRIPT_PATH} apps/web\``,
          );
        resolve();
      });
    });
    nuxt.hook("build:before", () => buildDone);
  },
});
