import { NON_SOURCE_SUFFIXES } from "#src/constants";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const SOURCE_DIRECTORY = "src";
const SOURCE_EXTENSION_REGEX = /\.(?:ts|vue)$/u;
const EXPORT_REGEX = /^export\s/mu;
// `readdirSync` yields the platform's separator while a barrel path is written with `/`, so every path is
// Normalised once before either is compared to the other — which also makes a fingerprint mean the same thing
// On both platforms rather than only within one.
const getNormalizedPath = (path: string): string => path.replaceAll("\\", "/");
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
// `generatedBarrelPaths` is the exact set ctix writes rather than a shape every `index.ts` matches, because a
// Nested `index.ts` is ordinary source here — a directory barrel, which the root barrel carries its own
// `export * from "./<directory>/index"` line for. Excluding it by shape hides the file that most needs to be
// Seen: adding one moves neither the path list nor an export bit, so generation is skipped and the package
// Ships without the export, green the whole way.
//
// `generatorPaths` closes the last half: the barrel is a function of the source list *and* of whatever wrote
// It, so ctix's own cli, the configs it is handed and the tsconfig those point at are hashed by content. Left out, an edit to a ctix config
// Or an upgrade of ctix leaves every package serving the barrel the previous generator wrote,
// Indistinguishable from a source tree nothing touched. They are a few hundred kilobytes read once per package
// Build, against a generation that costs seconds.
//
// `export:gen` remains a script, and running it by hand regenerates unconditionally.
export const getSourceFingerprint = (generatedBarrelPaths: string[], generatorPaths: string[]): string => {
  const generatedBarrels = new Set(
    generatedBarrelPaths.map((generatedBarrelPath) =>
      getNormalizedPath(relative(SOURCE_DIRECTORY, generatedBarrelPath)),
    ),
  );
  const sourcePaths = readdirSync(SOURCE_DIRECTORY, { encoding: "utf8", recursive: true })
    .map((sourcePath) => getNormalizedPath(sourcePath))
    .filter(
      (sourcePath) =>
        SOURCE_EXTENSION_REGEX.test(sourcePath) &&
        !NON_SOURCE_SUFFIXES.some((nonSourceSuffix) => sourcePath.endsWith(nonSourceSuffix)) &&
        !generatedBarrels.has(sourcePath),
    )
    .toSorted();
  const hash = createHash("sha256").update(
    sourcePaths.map((sourcePath) => `${sourcePath}:${String(checkHasExports(sourcePath))}`).join("\n"),
  );

  for (const generatorPath of generatorPaths) hash.update(readFileSync(generatorPath));

  return hash.digest("hex");
};
