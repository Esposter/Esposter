import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { BINARY_BYTE, CLAUDE_PATHSPEC_EXCLUDE } from "#src/services/sweeps/constants";
import { getControlCharacters } from "#src/services/sweeps/controlCharacters/getControlCharacters";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// A file holding a NUL is binary — an image, a wasm module, a font — and every byte in it is data rather than
// Source anyone reads. The heuristic is `git diff`'s own, and it is what lets this scan cover every tracked file
// Rather than a list of extensions that goes stale the first time the repo gains one.
//
// Generated files are read too, where a scan over source skips them — this one asks what a committed file holds
// Rather than what a source vouches for, which is the carve-out the `runtime-efficiency` skill names.
// Every tracked file in the repository but a vendored skill's (`readSweepFilePaths`), scanned, one `path:line: U+XXXX`
// Per character that renders as nothing.
export const readControlCharacterFindings = (): string[] =>
  readSweepFilePaths(CLAUDE_PATHSPEC_EXCLUDE).flatMap((path) => {
    const contents = readFileSync(resolve(REPOSITORY_ROOT, path));
    if (contents.includes(BINARY_BYTE)) return [];

    return getControlCharacters(contents.toString("utf8")).map(
      ({ codePoint, line }) => `${path}:${line}: U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}`,
    );
  });
