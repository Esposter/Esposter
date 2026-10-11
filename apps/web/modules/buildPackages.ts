import { spawn } from "node:child_process";
import { relative, sep } from "node:path";
import { defineNuxtModule } from "nuxt/kit";

const BUILD_CACHE_SCRIPT_PATH = ".agents/skills/throughput/scripts/build-cached.sh";

// Under `nuxt dev` the app's workspace packages are brought up to date once, at start, through the build cache.
// No tsdown watcher runs: every package edit by any session sharing the checkout used to rebuild and reload the page.
// That competed with the agents for CPU and memory.
// A start with nothing changed restores every `dist` instantly, and a package edit reaches the page on the next start.
// The build starts in `setup` and is awaited at `build:before`, so it overlaps Nuxt's own app preparation.
// A failed build stops Nuxt, since it would otherwise serve the packages' stale or missing `dist`. Bash runs from the
// Workspace root with both paths relative and forward-slashed, since bash on Windows reads a backslash in an argument as
// An escape.
export default defineNuxtModule({
  meta: { name: "build-packages" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev || process.env.VITEST) return;
    const packageDirectory = relative(nuxt.options.workspaceDir, nuxt.options.rootDir).split(sep).join("/");
    const build = spawn("bash", [BUILD_CACHE_SCRIPT_PATH, packageDirectory], {
      cwd: nuxt.options.workspaceDir,
      stdio: "inherit",
    });
    // Settled with the failure's message rather than rejected, so a build failing before `build:before` is no unhandled
    // Rejection
    const buildDone = new Promise<string | undefined>((resolve) => {
      build.on("error", (error) => {
        resolve(`The package build could not start: ${error.message}`);
      });
      build.on("close", (code) => {
        resolve(
          code === 0
            ? undefined
            : `A workspace package failed to build, see the failure with \`bash ${BUILD_CACHE_SCRIPT_PATH} apps/web\``,
        );
      });
    });
    nuxt.hook("build:before", async () => {
      const failure = await buildDone;
      // oxlint-disable-next-line error-handling/no-bare-error -- `@esposter/shared`, which holds InvalidOperationError, is one of the packages this build brings up
      if (failure) throw new Error(failure);
    });
  },
});
