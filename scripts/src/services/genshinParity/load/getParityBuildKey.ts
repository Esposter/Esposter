import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

// The key a production build of the parity page is kept under: the commit and each file the checkout has changed beside it,
// With its size and time, so a build is reused while nothing it reads has moved and rebuilt once a changed file is saved again
export const getParityBuildKey = (): string => {
  const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: REPOSITORY_ROOT, encoding: "utf8" }).stdout.trim();
  // NUL-separated, so a path is literal rather than quoted for its spaces, and a rename's entry is its new path, the
  // File on disk, followed by its old path as an entry of its own
  const entries = spawnSync("git", ["status", "--porcelain", "-z", "--untracked-files=all"], {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8",
  }).stdout.split("\0");
  const changedFiles: string[] = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry) continue;
    if (entry[0] === "R" || entry[0] === "C") index += 1;
    const changedPath = join(REPOSITORY_ROOT, entry.slice(3));
    if (!existsSync(changedPath)) {
      changedFiles.push(entry);
      continue;
    }
    const { mtimeMs, size } = statSync(changedPath);
    changedFiles.push(`${entry} ${size} ${mtimeMs}`);
  }
  return createHash("sha256")
    .update([head, ...changedFiles].join("\n"))
    .digest("hex");
};
