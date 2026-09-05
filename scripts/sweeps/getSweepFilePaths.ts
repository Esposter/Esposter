import { execFileSync } from "node:child_process";

// `--others` is load-bearing: without it a suite that is written but not yet `git add`ed is out of scope, and the
// Scan reports nothing for it — which reads exactly like a swept tree. `--exclude-standard` keeps ignored output
// (`dist`, `node_modules`) out, so the two flags are a pair rather than a widening.
export const getSweepFilePaths = (glob: string): string[] =>
  execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", glob], {
    encoding: "utf8",
    maxBuffer: 1 << 28,
  })
    .split("\n")
    .filter(Boolean)
    .filter((path) => !path.includes("node_modules/") && !path.includes("/.nuxt/"));
