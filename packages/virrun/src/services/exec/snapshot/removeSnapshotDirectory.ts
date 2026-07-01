import { readWslPath } from "@/services/exec/wsl/readWslPath";
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, lstatSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
// Removes a snapshot dir, restoring +rwx top-down first: a capture overlay's on-disk `work/work` scratch is left at
// Mode 000 (un-traversable), and Node's recursive rmSync refuses to chmod before descending, so a plain remove
// EACCES-es on it. Harmless on an ordinary tree, so callers needn't reason about whether a given dir is poisoned.
const makeTraversable = (dir: string): void => {
  chmodSync(dir, 0o700);
  for (const entry of readdirSync(dir, { withFileTypes: true }))
    if (entry.isDirectory()) makeTraversable(join(dir, entry.name));
};
// A `\\wsl.localhost\<distro>\...` or `\\wsl$\<distro>\...` UNC — the only dirs that need the WSL-side teardown
// Below. Plain win32 temp paths (e.g. a test's C: dir) carry no overlay poison and remove fine via Node.
const WSL_UNC_REGEX = /^\\\\wsl(?:\.localhost|\$)\\/iu;

export const removeSnapshotDirectory = (dir: string): void => {
  // A snapshot on the WSL distro's ext4 (reached via a `\\wsl.localhost` UNC) has an overlay workDir whose
  // `work/work` scratch is owned by the sandbox's namespaced root — the 9p bridge identity Windows uses can't
  // Chmod or remove it (EPERM), so neither makeTraversable nor rmSync works from here. Tear it down inside WSL
  // Instead, where the distro user owns it: chmod it traversable, then rm -rf. rm -rf is idempotent, so a missing
  // Dir is a no-op and needs no existence check.
  if (WSL_UNC_REGEX.test(dir)) {
    const linuxDir = readWslPath(dir);
    // Pass the path as a positional arg ($1), never interpolated into the script body — a snapshot/cache path
    // Containing a single quote would otherwise break the quoting and inject extra shell syntax.
    execFileSync(
      "wsl.exe",
      ["--exec", "sh", "-c", 'chmod -R u+rwx -- "$1" 2>/dev/null; rm -rf -- "$1"', "sh", linuxDir],
      { stdio: "pipe" },
    );
    return;
  }
  // Only a real directory needs the top-down +rwx restore before rmSync will descend it; a file or symlink (e.g. a
  // Generated artifact pruneSnapshotUpper drops) is not traversable, and makeTraversable's readdir would ENOTDIR on
  // It. lstat so a symlink is judged by the link, not its target. rmSync with force removes the leaf either way.
  if (existsSync(dir) && lstatSync(dir).isDirectory()) makeTraversable(dir);
  rmSync(dir, { force: true, recursive: true });
};
