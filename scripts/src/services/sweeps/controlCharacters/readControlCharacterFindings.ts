import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getControlCharacters } from "#src/services/sweeps/controlCharacters/getControlCharacters";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { lstatSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// A file holding a NUL is binary — an image, a wasm module, a font — and every byte in it is data rather than
// Source anyone reads. The heuristic is `git diff`'s own, and it is what lets this scan cover every tracked file
// Rather than a list of extensions that goes stale the first time the repo gains one.
const BINARY_BYTE = 0;
// pdf.js ships its CMap tables as `.bcmap`, a compiled binary format that happens to hold no NUL — the one thing
// In the tree the heuristic above cannot see through. Excluded as a pathspec rather than filtered afterwards, so
// Git never reads the 169 of them at all.
const VENDORED_BINARY_PATHSPEC = ":(exclude)apps/web/public/cmaps";

// Every tracked file in the repository, scanned, one `path:line: U+XXXX` per character that renders as nothing.
export const readControlCharacterFindings = (): string[] =>
  getSweepFilePaths(VENDORED_BINARY_PATHSPEC).flatMap((path) => {
    const absolutePath = resolve(REPOSITORY_ROOT, path);
    // `lstat` rather than `stat`, because the tracked entry git lists for `.claude` is the symlink and the
    // Directory it points at is `.agents`, which this scan already walks — following it would report every agent
    // File twice under a second path
    if (!lstatSync(absolutePath).isFile()) return [];

    const contents = readFileSync(absolutePath);
    if (contents.includes(BINARY_BYTE)) return [];

    return getControlCharacters(contents.toString("utf8")).map(
      ({ codePoint, line }) => `${path}:${line}: U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
    );
  });
