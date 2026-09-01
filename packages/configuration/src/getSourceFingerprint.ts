import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const SOURCE_DIRECTORY = "src";
const GENERATED_BARREL_REGEX = /(?:^|[/\\])index\.ts$/u;
const NON_SOURCE_REGEX = /\.(?:bench|test|test-d)\.ts$/u;
const SOURCE_EXTENSION_REGEX = /\.(?:ts|vue)$/u;
const EXPORT_REGEX = /^export\s/mu;
// Ctix omits a file that exports nothing, so the barrel lists the source files filtered by whether each exports
// At all — the one thing about a file's contents a barrel of `export * from` lines can depend on. A `.vue` file
// Is listed by its own ctix pass whatever its script block holds, so it carries no probe.
const checkHasExports = (sourcePath: string): boolean =>
  !sourcePath.endsWith(".ts") || EXPORT_REGEX.test(readFileSync(join(SOURCE_DIRECTORY, sourcePath), "utf8"));

// Which files exist and which of them export anything — never what those exports are. Every barrel ctix
// Generates here is `export * from` and names no symbol, so a file that gains, renames or drops an export is
// Already covered by the line the barrel has for it, and the edit that dominates a working day cannot alter the
// Barrel at all. That is the whole point: a fingerprint over contents would miss on every keystroke and the
// Generation would never be skipped.
//
// The export bit is what a bare path list cannot see. ctix leaves an export-less file out entirely, so a file
// Crossing from exporting nothing to exporting something needs a barrel line it does not have, on a source list
// That did not change — the one transition where a stale barrel builds green and the new API is simply absent
// From the package. The bit flips exactly there and on no other edit, so it costs the skip nothing.
//
// `generatorPaths` closes the last half: the barrel is a function of the source list *and* of whatever wrote
// It, so ctix's own cli and the configs it is handed are hashed by content. Left out, an edit to a ctix config
// Or an upgrade of ctix leaves every package serving the barrel the previous generator wrote,
// Indistinguishable from a source tree nothing touched. They are a few hundred kilobytes read once per package
// Build, against a generation that costs seconds.
//
// `export:gen` remains a script, and running it by hand regenerates unconditionally.
export const getSourceFingerprint = (generatorPaths: string[]): string => {
  const sourcePaths = readdirSync(SOURCE_DIRECTORY, { encoding: "utf8", recursive: true })
    .filter(
      (sourcePath) =>
        SOURCE_EXTENSION_REGEX.test(sourcePath) &&
        !NON_SOURCE_REGEX.test(sourcePath) &&
        !GENERATED_BARREL_REGEX.test(sourcePath),
    )
    .toSorted();
  const hash = createHash("sha256").update(
    sourcePaths.map((sourcePath) => `${sourcePath}:${String(checkHasExports(sourcePath))}`).join("\n"),
  );

  for (const generatorPath of generatorPaths) hash.update(readFileSync(generatorPath));

  return hash.digest("hex");
};
