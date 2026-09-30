import type { ChildProcess } from "node:child_process";
import type { PackageJson } from "type-fest";

import { spawn, spawnSync } from "node:child_process";
import { globSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { defineNuxtModule } from "nuxt/kit";

const CONFIGURATION_PACKAGE_NAME = "configuration";
const WORKSPACE_PROTOCOL = "workspace:";

const readPackageJson = (directory: string): PackageJson =>
  // oxlint-disable-next-line no-restricted-properties -- a manifest holds no dates to revive
  JSON.parse(readFileSync(join(directory, "package.json"), "utf8")) as PackageJson;
// A sibling a package lists as a dependency or peer stays external in its `dist`, so the app loads that sibling's `dist`
// Too; a devDependency is bundled from source, which the package's own watcher already follows
const getRuntimeWorkspaceDependencies = (packageJson: PackageJson): string[] =>
  Object.entries({ ...packageJson.dependencies, ...packageJson.peerDependencies })
    .filter(([, version]) => version?.startsWith(WORKSPACE_PROTOCOL))
    .map(([name]) => name);
// The app runs every workspace package from its `dist`, so under `nuxt dev` tsdown watches the source of each package
// The running app loads — the closure of its dependencies — and a package edit reaches the page as a reload. Each
// Watcher is a plain `node` child of this process rather than a `pnpm exec`, so Ctrl+C stops them all with Nuxt instead
// Of every Windows `.cmd` shim asking to terminate its batch job. The configuration package is built once first and
// Never watched: every package's `tsdown.config.ts` imports its `dist`, which its own watcher would clean from under them
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
    const watchers: ChildProcess[] = Array.from(watchedPackageNames, (packageName) =>
      spawn(process.execPath, [tsdownPath, "--watch"], { cwd: packageDirectoryMap.get(packageName), stdio: "inherit" }),
    );
    nuxt.hook("close", () => {
      for (const watcher of watchers) watcher.kill();
    });
  },
});
