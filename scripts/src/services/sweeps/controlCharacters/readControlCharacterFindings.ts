import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getControlCharacters } from "#src/services/sweeps/controlCharacters/getControlCharacters";
import { getSweepFilePaths } from "#src/services/sweeps/getSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// A file holding a NUL is binary — an image, a wasm module, a font — and every byte in it is data rather than
// Source anyone reads. The heuristic is `git diff`'s own, and it is what lets this scan cover every tracked file
// Rather than a list of extensions that goes stale the first time the repo gains one.
//
// Generated files are read too, where a scan over source skips them — this one asks what a committed file holds
// Rather than what a source vouches for, which is the carve-out the `runtime-efficiency` skill names.
const BINARY_BYTE = 0;
// The CMap tables `pdf.js` ships are `.bcmap`, a compiled binary format that happens to hold no NUL — the one
// Thing in the tree the heuristic above cannot see through. `.claude` is the symlink to `.agents`, which this
// Scan already walks, and reading it throws rather than returning bytes. Both are excluded as pathspecs so that
// Git never lists them: testing every one of the tree's 7500 entries for a directory costs a `stat` each, a
// Quarter of this scan's whole running time, to catch the one entry named here.
const EXCLUDED_PATHSPECS = [":(exclude)apps/web/public/cmaps", ":(exclude).claude"];

// Every tracked file in the repository, scanned, one `path:line: U+XXXX` per character that renders as nothing.
export const readControlCharacterFindings = (): string[] =>
  getSweepFilePaths(...EXCLUDED_PATHSPECS).flatMap((path) => {
    const contents = readFileSync(resolve(REPOSITORY_ROOT, path));
    if (contents.includes(BINARY_BYTE)) return [];

    return getControlCharacters(contents.toString("utf8")).map(
      ({ codePoint, line }) => `${path}:${line}: U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
    );
  });
