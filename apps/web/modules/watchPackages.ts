import type { ChildProcess } from "node:child_process";
import type { PackageJson } from "type-fest";

import { spawn, spawnSync } from "node:child_process";
import { globSync, readFileSync, rmSync, watch } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { defineNuxtModule, useLogger } from "nuxt/kit";

const CONFIGURATION_PACKAGE_NAME = "configuration";
const WATCHER_RESPAWN_DELAY = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
const WORKSPACE_PROTOCOL = "workspace:";
const SOURCE_PATTERNS = ["src/**/*.ts", "src/**/*.vue"];
const logger = useLogger("watch-packages");

const readPackageJson = (directory: string): PackageJson =>
  // oxlint-disable-next-line no-restricted-properties -- a manifest carries no dates, and no workspace dist exists yet at install
  JSON.parse(readFileSync(join(directory, "package.json"), "utf8")) as PackageJson;
// A sibling a package lists as a dependency or peer stays external in its `dist`, so the app loads that sibling's
// `dist` too; a devDependency is bundled from source, which the package's own watcher already follows
const getRuntimeWorkspaceDependencies = (packageJson: PackageJson): string[] =>
  Object.entries<string | undefined>({ ...packageJson.dependencies, ...packageJson.peerDependencies })
    .filter(([, version]) => version?.startsWith(WORKSPACE_PROTOCOL))
    .map(([name]) => name);
const readSourceFileList = (packageDirectory: string): string =>
  globSync(SOURCE_PATTERNS, { cwd: packageDirectory }).toSorted().join("\n");
// The app runs every workspace package from its `dist`, so under `nuxt dev` tsdown watches the source of each package
// The running app loads — the closure of its dependencies — and a package edit reaches the page as a reload. Each
// Watcher is a plain `node` child of this process rather than a `pnpm exec`, so Ctrl+C stops them all with Nuxt
// Instead of every Windows `.cmd` shim asking to terminate its batch job. The configuration package is built once
// First and never watched: every package's `tsdown.config.ts` imports its `dist`, which its own watcher would clean
// From under them
export default defineNuxtModule({
  meta: { name: "watch-packages" },
  setup: (_options, nuxt) => {
    if (!nuxt.options.dev || process.env.VITEST) return;
    const packagesDirectory = join(nuxt.options.workspaceDir, "packages");
    const packageDirectoryMap = new Map(
      globSync("*/tsdown.config.ts", { cwd: packagesDirectory }).map((path) => {
        const packageDirectory = join(packagesDirectory, dirname(path));
        return [readPackageJson(packageDirectory).name ?? "", packageDirectory];
      }),
    );
    const watchedPackageNames = new Set<string>();
    const pendingPackageNames = getRuntimeWorkspaceDependencies(readPackageJson(nuxt.options.rootDir));
    for (const packageName of pendingPackageNames) {
      const packageDirectory = packageDirectoryMap.get(packageName);
      if (!packageDirectory || watchedPackageNames.has(packageName)) continue;
      watchedPackageNames.add(packageName);
      pendingPackageNames.push(...getRuntimeWorkspaceDependencies(readPackageJson(packageDirectory)));
    }

    const configurationDirectory = join(packagesDirectory, CONFIGURATION_PACKAGE_NAME);
    const tsdownPath = createRequire(join(configurationDirectory, "package.json")).resolve("tsdown/run");
    spawnSync(process.execPath, [tsdownPath], { cwd: configurationDirectory, stdio: "inherit" });
    const watcherMap = new Map<string, ChildProcess>();
    // The packages whose watcher is being restarted for a change to their file list rather than having failed
    const restartingPackageNames = new Set<string>();
    let isClosing = false;
    // A cleaning tsdown watcher deletes the last build's files as each rebuild starts, so a page loaded mid-rebuild
    // Finds no `dist` to import. The watchers overwrite in place instead, and each `dist` is cleared once here so a
    // Hashed chunk from an earlier session is not left for a size snapshot to measure
    for (const packageName of watchedPackageNames) {
      const packageDirectory = packageDirectoryMap.get(packageName);
      if (packageDirectory) rmSync(join(packageDirectory, "dist"), { force: true, recursive: true });
    }
    // A watcher exits when its config fails to reload, which a rebuild of the configuration `dist` it imports causes by
    // Cleaning it mid-reload, so an exit respawns it after a pause rather than leaving its package silently stale
    const spawnWatcher = (packageName: string) => {
      const watcher = spawn(process.execPath, [tsdownPath, "--watch", "--no-clean"], {
        cwd: packageDirectoryMap.get(packageName),
        stdio: "inherit",
      });
      watcher.on("exit", (code) => {
        if (isClosing) return;
        if (restartingPackageNames.delete(packageName))
          logger.info(`A source file of ${packageName} was added or removed, restarting its tsdown watcher`);
        else logger.warn(`tsdown watcher for ${packageName} exited with code ${code}, respawning`);
        setTimeout(() => {
          if (!isClosing) spawnWatcher(packageName);
        }, WATCHER_RESPAWN_DELAY);
      });
      watcherMap.set(packageName, watcher);
    };
    // A watcher generates its package's barrel once, as it starts, so a module added later would be missing from the
    // Barrel and one removed would still be listed: a change to the package's file list restarts the watcher, which
    // Regenerates it. An editor that saves by renaming over the file leaves the list as it was, so it restarts nothing
    const sourceWatchers = [...watchedPackageNames].flatMap((packageName) => {
      const packageDirectory = packageDirectoryMap.get(packageName);
      if (!packageDirectory) return [];
      let sourceFileList = readSourceFileList(packageDirectory);
      let timeout: ReturnType<typeof setTimeout> | undefined;
      const sourceWatcher = watch(join(packageDirectory, "src"), { recursive: true }, (eventType) => {
        if (eventType !== "rename") return;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          const nextSourceFileList = readSourceFileList(packageDirectory);
          if (isClosing || nextSourceFileList === sourceFileList) return;
          sourceFileList = nextSourceFileList;
          restartingPackageNames.add(packageName);
          watcherMap.get(packageName)?.kill();
        }, WATCHER_RESPAWN_DELAY);
      });
      return [sourceWatcher];
    });
    for (const packageName of watchedPackageNames) spawnWatcher(packageName);
    nuxt.hook("close", () => {
      isClosing = true;
      for (const sourceWatcher of sourceWatchers) sourceWatcher.close();
      for (const watcher of watcherMap.values()) watcher.kill();
    });
  },
});
