import { createHash } from "node:crypto";
import { readdirSync } from "node:fs";

const SOURCE_DIRECTORY = "src";
const GENERATED_BARREL_REGEX = /(?:^|[/\\])index\.ts$/u;
const NON_SOURCE_REGEX = /\.(?:bench|test|test-d)\.ts$/u;
const SOURCE_EXTENSION_REGEX = /\.(?:ts|vue)$/u;

// Which files exist, and nothing about what is in them. Every barrel ctix generates here is `export * from`
// And nothing else — no package names a symbol — so the barrel is a function of the file list alone, and the
// Edit that dominates a working day, changing a file's contents, cannot alter it. That is the whole point:
// A fingerprint over contents would miss on every keystroke and the generation would never be skipped.
//
// The one case this cannot see is a file that exported nothing and now exports something, since ctix omits a
// File with no exports and one export per file is the convention that keeps that hypothetical. `export:gen`
// Is still a script, and running it by hand regenerates unconditionally.
export const getSourceFingerprint = (): string => {
  const sourcePaths = readdirSync(SOURCE_DIRECTORY, { encoding: "utf8", recursive: true })
    .filter(
      (sourcePath) =>
        SOURCE_EXTENSION_REGEX.test(sourcePath) &&
        !NON_SOURCE_REGEX.test(sourcePath) &&
        !GENERATED_BARREL_REGEX.test(sourcePath),
    )
    .toSorted();
  return createHash("sha256").update(sourcePaths.join("\n")).digest("hex");
};
