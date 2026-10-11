import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";

// The index entry of a text file stored with a carriage return. `git ls-files --eol` reads `i/` off the index, so a
// File the attributes ask for CRLF (`eol=crlf`) is stored that way on purpose and is no finding
const CRLF_INDEX_PATTERN = /^i\/(?:crlf|mixed)\s/u;

// The tracked text files stored with a carriage return that `.gitattributes` does not ask for. Such a file reads as
// Modified on every checkout that normalises it, and a replay that touches it stops on a dirty tree
export const readCrlfStoredPaths = (cwd?: string): string[] =>
  getNonEmptyLines(runGit(["ls-files", "--eol"], cwd)).flatMap((line) => {
    const [entry = "", path = ""] = line.split("\t");
    return CRLF_INDEX_PATTERN.test(entry) && !entry.includes("eol=crlf") ? [path] : [];
  });
