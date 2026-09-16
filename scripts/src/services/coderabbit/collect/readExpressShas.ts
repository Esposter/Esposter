import { COMMIT_BODY_FORMAT, EXPRESS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { getTrailerValues } from "#src/services/coderabbit/collect/getTrailerValues";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";

// Which of these commits claim no review, in one read. Every caller asks it of a whole owed set, and a read per
// Commit is a git spawn per commit — most expensive exactly when the queue is deepest, which is the case the
// Reshaper exists to clear
export const readExpressShas = (shas: string[], cwd?: string): Set<string> => {
  if (shas.length === 0) return new Set();
  const log = runGit(["log", "--no-walk", `--format=${COMMIT_BODY_FORMAT}`, ...shas], cwd);
  return new Set(
    log
      .split(RECORD_SEPARATOR)
      .map((record) => record.trim())
      .filter(Boolean)
      .map((record) => record.split(FIELD_SEPARATOR))
      .filter(([, body = ""]) => getTrailerValues(body, EXPRESS_TRAILER).length > 0)
      .map(([sha = ""]) => sha),
  );
};
