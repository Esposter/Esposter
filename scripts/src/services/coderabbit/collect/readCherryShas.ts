import { COMMIT_BODY_FORMAT, MAIN_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getCherryShas } from "#src/services/coderabbit/collect/getCherryShas";
import { getPortedShas } from "#src/services/coderabbit/collect/getPortedShas";
import { readPortedShas } from "#src/services/coderabbit/collect/readPortedShas";
import { getGitRecords } from "#src/services/shared/getGitRecords";
import { runGit } from "#src/services/shared/runGit";

// What `head` still owes `upstream`: not on it by patch id, and no identity of it named as the original of a copy
// `upstream` carries — or of a copy `main` carries, since the express lane cuts a queue commit onto `main` while
// A window is still in flight and the fold brings it to `develop` later. The copy test is the exact one — a fix
// Landing within a hunk's context lines changes the copy's patch id, after which `git cherry` reads a ported
// Commit as owed and re-picking it is the conflict nobody authored. A commit's identities are its own sha and
// Every original its own body names: each rewrite of the queue replays it with `-x`, so a commit rewritten a
// Dozen times carries a dozen earlier shas, and the copy `main` took of it names whichever one it had at the cut.
// Matching the newest alone reads that copy as no port at all. Only commits the head authored count: a merge of
// `main` into the queue brings `main`'s commits and the merge itself.
export const readCherryShas = (upstream: string, head: string, cwd?: string): string[] => {
  const main = `origin/${MAIN_BRANCH}`;
  // `git cherry` reads a commit that changes nothing as owed, and it can never be: what an empty commit carries
  // Is its message, and the message is the record that the target already holds the change (`checkIsPicked`,
  // `getSyncPrompt`). So the diff filter drops it here, and the queue sheds it on the rewrite that follows
  const authoredRecords = getGitRecords(
    runGit(
      [
        "log",
        `--format=${COMMIT_BODY_FORMAT}`,
        "--no-merges",
        "--diff-filter=ACDMRT",
        head,
        `^${upstream}`,
        `^${main}`,
      ],
      cwd,
    ),
  );
  const shaIdentitiesMap = new Map(
    authoredRecords.map(([sha = "", body = ""]) => [sha, [sha, ...getPortedShas(body)]]),
  );
  const portedShas = new Set([...readPortedShas(upstream, cwd), ...readPortedShas(main, cwd)]);
  return getCherryShas(runGit(["cherry", upstream, head], cwd)).filter((sha) => {
    const identities = shaIdentitiesMap.get(sha);
    return identities !== undefined && !identities.some((identity) => portedShas.has(identity));
  });
};
