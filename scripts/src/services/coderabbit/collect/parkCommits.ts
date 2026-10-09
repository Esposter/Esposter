import type { ParkCommitsInput } from "#src/models/coderabbit/collect/ParkCommitsInput";

import { HELD_MARKER, MAIN_BRANCH, QUEUE_BRANCH } from "#src/services/coderabbit/collect/constants";
import { getHeldBranch } from "#src/services/coderabbit/collect/getHeldBranch";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { openCollectorIssue } from "#src/services/coderabbit/collect/openCollectorIssue";
import { runGit } from "#src/services/shared/runGit";
import { takeOne } from "@esposter/shared";

// Takes commits no window could carry past its cap out of the queue's way without losing one: each is pushed to its own
// Held branch first, and only then is the one issue opened that says how to re-land them. A push failure is thrown, since
// A caller drops a commit from the replay only once this returns. The push is plain: creating the branch is the Admin
// Bypass of the branch creation ruleset, and pushing the same sha again is a no-op. The re-land is a `--no-commit` pick
// Committed under a message of its own: the message the pick prepares keeps the held commit's "(cherry picked from
// Commit …)" lines, and `-x` adds one, each naming a sha the held branch carries, and a copy naming one stays out of
// The owed set (`readHeldShas`) until that branch is deleted. The collector tries the same re-land itself each time
// `main` moves (`relandHeldCommits`), so the steps are for a re-land by hand
export const parkCommits = ({ cause, cwd, isDryRun, shas, viewerLogin }: ParkCommitsInput): void => {
  const commits = shas.map((sha) => ({
    branch: getHeldBranch(sha),
    sha,
    subject: runGit(["log", "-1", "--format=%s", sha], cwd).trim(),
  }));
  for (const { branch, sha } of commits)
    if (isDryRun) console.info(`would push ${sha} to ${branch}`);
    else {
      runGit(["push", "origin", `${sha}:refs/heads/${branch}`], cwd);
      console.info(`pushed ${sha} to ${branch}`);
    }

  const { sha: firstSha, subject: firstSubject } = takeOne(commits);
  const body = [
    cause,
    "",
    ...commits.map(({ branch, sha, subject }) => `- ${sha} ${subject}, held on \`${branch}\``),
    "",
    `The collector tries the re-land itself as \`${MAIN_BRANCH}\` moves, up to its attempts, and closes this issue once every commit is back. To re-land them by hand, on \`${QUEUE_BRANCH}\`:`,
    "",
    "1. `git fetch origin`",
    '2. For each held branch above, in order: `git cherry-pick --no-commit origin/<branch>`, settle what the cause names by splitting it under the cap or resolving the conflict, then commit each part under a message of its own, `git commit -m "<subject>"` — never the message the pick prepares, nor `-x`: either can carry a "(cherry picked from commit …)" line naming a sha the held branch carries, and a commit naming one is owed nowhere until that branch is deleted',
    "3. `pnpm ai:queue:push`, after which each new commit ports like any other",
    "4. `git push origin --delete <branch>` for each held branch, then close this issue",
  ].join("\n");
  openCollectorIssue({
    body,
    isDryRun,
    marker: getMarker(HELD_MARKER, firstSha),
    title: `Held: ${firstSubject} (${commits.length} ${commits.length === 1 ? "commit" : "commits"})`,
    viewerLogin,
  });
};
