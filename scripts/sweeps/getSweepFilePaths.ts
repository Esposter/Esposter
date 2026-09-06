import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

// `--others` is load-bearing: without it a suite that is written but not yet `git add`ed is out of scope, and the
// Scan reports nothing for it — which reads exactly like a swept tree. `--exclude-standard` keeps ignored output
// (`dist`, `node_modules`) out, so the two flags are a pair rather than a widening.
//
// The cwd is pinned to the repository root rather than inherited: `git ls-files` is relative to where it runs, so
// A scan started from a package directory would quietly cover that package alone and report a short clean list —
// The same silent-pass this whole scan exists to avoid, wearing a different hat.
export const getSweepFilePaths = (glob: string): string[] =>
  execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", glob], {
    cwd: resolve(import.meta.dirname, "..", ".."),
    encoding: "utf8",
    maxBuffer: 1 << 28,
  })
    .split("\n")
    .filter(Boolean)
    .filter((path) => !path.includes("node_modules/") && !path.includes("/.nuxt/"));
