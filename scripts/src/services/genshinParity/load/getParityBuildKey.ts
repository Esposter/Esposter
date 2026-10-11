import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";

// The key a production build of the parity page is kept under: the commit and each file the checkout has changed beside it,
// With its size and time, so a build is reused while nothing it reads has moved and rebuilt once a changed file is saved again
export const getParityBuildKey = (): string => {
  const head = spawnSync("git", ["rev-parse", "HEAD"], { cwd: REPOSITORY_ROOT, encoding: "utf8" }).stdout.trim();
  const status = spawnSync("git", ["status", "--porcelain", "--untracked-files=all"], {
    cwd: REPOSITORY_ROOT,
    encoding: "utf8",
  }).stdout;
  const changedFiles = status
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      // A rename's line names both paths, and the new one is the file on disk
      const changedPath = join(REPOSITORY_ROOT, line.slice(3).split(" -> ").at(-1) ?? "");
      if (!existsSync(changedPath)) return line;
      const { mtimeMs, size } = statSync(changedPath);
      return `${line} ${size} ${mtimeMs}`;
    });
  return createHash("sha256")
    .update([head, ...changedFiles].join("\n"))
    .digest("hex");
};
