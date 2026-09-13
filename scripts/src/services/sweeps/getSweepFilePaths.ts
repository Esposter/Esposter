import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { execFileSync } from "node:child_process";

// `--others` is load-bearing: without it a suite that is written but not yet `git add`ed is out of scope, and the
// Scan reports nothing for it — which reads exactly like a swept tree. `--exclude-standard` keeps ignored output
// (`dist`, `node_modules`) out, so the two flags are a pair rather than a widening.
//
// The cwd is pinned to the repository root rather than inherited: `git ls-files` is relative to where it runs, so
// A scan started from a package directory would quietly cover that package alone and report a short clean list —
// The same silent-pass this whole scan exists to avoid, wearing a different hat.
export const getSweepFilePaths = (glob: string): string[] =>
  getNonEmptyLines(
    execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", glob], {
      cwd: REPOSITORY_ROOT,
      encoding: "utf8",
      maxBuffer: 1 << 28,
    }),
  ).filter((path) => !path.includes("node_modules/") && !path.includes("/.nuxt/"));
