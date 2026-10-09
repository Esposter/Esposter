import { execFileSync } from "node:child_process";
import { basename } from "node:path";

// The barrels a package's build writes into its own `src`. The repository's .gitignore names exactly these
// (`**/src/index.ts`, `**/src/components/index.ts`), so an ignored `index.ts` under `src` is build output, never an
// Input, and it is kept out of the key and carried in the cache entry instead.
export const readGeneratedBarrelPaths = (packageDirectory: string): string[] =>
  execFileSync("git", ["ls-files", "--others", "--ignored", "--exclude-standard", "--", "src"], {
    cwd: packageDirectory,
    encoding: "utf8",
  })
    .split(/\r?\n/u)
    .filter((path) => path !== "" && basename(path) === "index.ts")
    .toSorted();
