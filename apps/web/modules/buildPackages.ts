import { spawn } from "node:child_process";
import { join, relative, sep } from "node:path";
import { defineNuxtModule, useLogger } from "nuxt/kit";

const BUILD_CACHE_ENTRY_PATH = "scripts/src/buildCache/index.ts";
const TSX_CLI_PATH = "scripts/node_modules/tsx/dist/cli.mjs";
const logger = useLogger("build-packages");

// Under `nuxt dev` the app's workspace packages are brought up to date once, at start, through the build cache.
// No tsdown watcher runs: every package edit by any session sharing the checkout used to rebuild and reload the page.
// That competed with the agents for CPU and memory.
// A start with nothing changed restores every `dist` instantly, and a package edit reaches the page on the next start.
// The build starts in `setup` and is awaited at `build:before`, so it overlaps Nuxt's own app preparation.
// A failed build is logged and does not stop Nuxt. No shell is in this path: on Windows `bash` can be WSL's, which cannot
// Read a Windows path, so node starts the build's entry itself, from the workspace root, with the package's directory.
export default defineNuxtModule({
  meta: { name: "build-packages" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev || process.env.VITEST) return;
    const packageDirectory = relative(nuxt.options.workspaceDir, nuxt.options.rootDir).split(sep).join("/");
    const reproduceCommand = `node --conditions=source ${TSX_CLI_PATH} ${BUILD_CACHE_ENTRY_PATH} ${packageDirectory}`;
    const build = spawn(
      process.execPath,
      [
        "--conditions=source",
        join(nuxt.options.workspaceDir, TSX_CLI_PATH),
        join(nuxt.options.workspaceDir, BUILD_CACHE_ENTRY_PATH),
        nuxt.options.rootDir,
      ],
      { cwd: nuxt.options.workspaceDir, stdio: "inherit" },
    );
    const buildDone = new Promise<void>((resolve) => {
      build.on("error", (error) => {
        resolve(`The package build could not start: ${error.message}`);
      });
      build.on("close", (code) => {
        if (code !== 0)
          logger.error(`A workspace package failed to build, see the failure with \`${reproduceCommand}\``);
        resolve();
      });
    });
    nuxt.hook("build:before", async () => {
      const failure = await buildDone;
      // oxlint-disable-next-line error-handling/no-bare-error -- `@esposter/shared`, which holds InvalidOperationError, is one of the packages this build brings up
      if (failure) throw new Error(failure);
    });
  },
});
