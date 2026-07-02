import { WSL_REMOVE_SCRIPT, WSL_UNC_REGEX } from "@/services/exec/wsl/constants";
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
export const removeSnapshotDirectory = (dir: string): void => {
  // A snapshot on the WSL distro's ext4 (reached via a `\\wsl.localhost` UNC) has an overlay workDir whose
  // `work/work` scratch is owned by the sandbox's namespaced root — the 9p bridge identity Windows uses can't
  // Chmod or remove it (EPERM), so neither makeTraversable nor rmSync works from here. Tear it down inside WSL
  // Instead, where the distro user owns it (WSL_REMOVE_SCRIPT). rm -rf is idempotent, so a missing dir is a no-op.
  if (WSL_UNC_REGEX.test(dir)) {
    const linuxDir = readWslPath(dir);
    execFileSync("wsl.exe", ["--exec", "sh", "-c", WSL_REMOVE_SCRIPT, "sh", linuxDir], { stdio: "pipe" });
    return;
  }
  // Only a real directory needs the top-down +rwx restore before rmSync will descend it; a file or symlink (e.g. a
  // Generated artifact pruneSnapshotUpper drops) is not traversable, and makeTraversable's readdir would ENOTDIR on
  // It. lstat so a symlink is judged by the link, not its target. rmSync with force removes the leaf either way.
  if (existsSync(dir) && lstatSync(dir).isDirectory()) makeTraversable(dir);
  rmSync(dir, { force: true, recursive: true });
};
