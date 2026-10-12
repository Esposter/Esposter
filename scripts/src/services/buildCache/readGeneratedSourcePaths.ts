import { execFileSync } from "node:child_process";
import { basename } from "node:path";

const GENERATED_DIRECTORY = "src/generated/";

// The files a package's build writes into its own `src`: the barrels, and whatever a build hook generates under
// `src/generated`. The repository's .gitignore names exactly these (`**/src/index.ts`, `**/src/components/index.ts`,
// `**/src/generated/...`), so an ignored `index.ts` or an ignored file under `src/generated` is build output, never an
// Input, and it is kept out of the key and carried in the cache entry instead.
export const readGeneratedSourcePaths = (packageDirectory: string): string[] =>
  execFileSync("git", ["ls-files", "--others", "--ignored", "--exclude-standard", "--", "src"], {
    cwd: packageDirectory,
    encoding: "utf8",
  })
    .split(/\r?\n/u)
    .filter((path) => path !== "" && (basename(path) === "index.ts" || path.startsWith(GENERATED_DIRECTORY)))
    .toSorted();
