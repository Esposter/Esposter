import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { spawnGit } from "#src/services/shared/spawnGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// `git grep` exits with this status when nothing matched, which is the answer rather than a failure
const NO_MATCH_STATUS = 1;
const CARRIAGE_RETURN_LINE_END = String.raw`\r$`;

// The tracked text files whose index entry ends a line with a carriage return and that `.gitattributes` does not ask
// For (`eol=crlf`). Such a file reads as modified on every checkout that normalises it, and a replay that touches it
// Stops on a dirty tree. `git grep --cached` reads the index's own blobs and skips a binary file by its NUL, where
// `git ls-files --eol` also stats and reads every file of the working tree for a column this does not use, which took
// Sixteen times as long on this tree.
export const readCrlfStoredPaths = (cwd: string = REPOSITORY_ROOT): string[] => {
  const { status, stderr, stdout } = spawnGit(
    ["grep", "--cached", "-I", "-l", "-P", CARRIAGE_RETURN_LINE_END, "--", ".", ":(exclude,attr:eol=crlf)"],
    cwd,
  );
  if (status === NO_MATCH_STATUS) return [];
  if (status !== 0) throw new InvalidOperationError(Operation.Read, "git grep", stderr);

  return getNonEmptyLines(stdout);
};
