import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

// Runs a package's own tsdown with node itself, never through a shell: on Windows `bash` can resolve to WSL's, which
// Cannot read a Windows path. Returns the exit status, null when a signal ended the build
export const runTsdown = (packageDirectory: string, flags: readonly string[]): number | null => {
  const tsdownManifestPath = createRequire(join(packageDirectory, "package.json")).resolve("tsdown/package.json");
  const tsdownManifest = JSON.parse(readFileSync(tsdownManifestPath, "utf8")) as { bin: { tsdown: string } };
  const tsdownBinaryPath = join(dirname(tsdownManifestPath), tsdownManifest.bin.tsdown);
  const build = spawnSync(process.execPath, [tsdownBinaryPath, ...flags], { cwd: packageDirectory, stdio: "inherit" });
  return build.status;
};
