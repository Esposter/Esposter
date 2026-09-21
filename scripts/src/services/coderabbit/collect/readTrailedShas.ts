import { COMMIT_BODY_FORMAT } from "#src/services/coderabbit/collect/constants";
import { getBasisText } from "#src/services/coderabbit/collect/getBasisText";
import { getTrailerValues } from "#src/services/coderabbit/collect/getTrailerValues";
import { getGitRecords } from "#src/services/shared/getGitRecords";
import { runGit } from "#src/services/shared/runGit";

// Which of these commits carry the trailer — the claim of no review, the record of a repair — in one read. Every
// Caller asks it of a whole set, and a read per commit is a git spawn per commit — most expensive exactly when
// The queue is deepest, which is the case the reshaper exists to clear. A basis narrows it to the commits whose
// Trailer names that sha, since a trailer recording an attempt is counted only against the code that made it
// (`getBasisText`); without one, any value the trailer carries answers.
export const readTrailedShas = (shas: string[], trailer: string, cwd?: string, basisSha?: string): Set<string> => {
  if (shas.length === 0) return new Set();
  const basisText = basisSha === undefined ? "" : getBasisText([basisSha]);
  const log = runGit(["log", "--no-walk", `--format=${COMMIT_BODY_FORMAT}`, ...shas], cwd);
  return new Set(
    getGitRecords(log)
      .filter(([, body = ""]) => getTrailerValues(body, trailer).some((value) => value.endsWith(basisText)))
      .map(([sha = ""]) => sha),
  );
};
