import { COMMIT_BODY_FORMAT } from "#src/services/coderabbit/collect/constants";
import { getTrailerValues } from "#src/services/coderabbit/collect/getTrailerValues";
import { FIELD_SEPARATOR, RECORD_SEPARATOR } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";

// Which of these commits carry the trailer — the claim of no review, the record of a repair — in one read. Every
// Caller asks it of a whole set, and a read per commit is a git spawn per commit — most expensive exactly when
// The queue is deepest, which is the case the reshaper exists to clear
export const readTrailedShas = (shas: string[], trailer: string, cwd?: string): Set<string> => {
  if (shas.length === 0) return new Set();
  const log = runGit(["log", "--no-walk", `--format=${COMMIT_BODY_FORMAT}`, ...shas], cwd);
  return new Set(
    log
      .split(RECORD_SEPARATOR)
      .map((record) => record.trim())
      .filter(Boolean)
      .map((record) => record.split(FIELD_SEPARATOR))
      .filter(([, body = ""]) => getTrailerValues(body, trailer).length > 0)
      .map(([sha = ""]) => sha),
  );
};
