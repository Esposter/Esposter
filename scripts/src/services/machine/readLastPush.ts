import type { LastPush } from "#src/models/shared/LastPush";

import { FIELD_SEPARATOR, REMOTE_QUEUE_REF, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// The last commit this machine's git identity, its name and its email both, landed on the queue as origin holds it, or
// Undefined when it has landed none. An unset identity or a missing queue ref is that answer too: a machine with no
// Identity cannot have pushed
export const readLastPush = (repositoryRoot: string = REPOSITORY_ROOT): LastPush | undefined =>
  getResult(() => {
    const name = runGit(["config", "user.name"], repositoryRoot).trim();
    const email = runGit(["config", "user.email"], repositoryRoot).trim();
    // `--author` is a substring match on the author line, so it only narrows the commits; the name and the email are then
    // Compared whole, newest first
    const commits = getNonEmptyLines(
      runGit(
        ["log", "--fixed-strings", `--author=${name}`, "--format=%H%x1f%aI%x1f%an%x1f%ae", REMOTE_QUEUE_REF],
        repositoryRoot,
      ),
    ).map((line) => line.split(FIELD_SEPARATOR));
    const [sha, at] =
      commits.find(([, , authorName, authorEmail]) => authorName === name && authorEmail === email) ?? [];
    return sha === undefined || at === undefined ? undefined : { at, sha };
  }).match(
    (lastPush) => lastPush,
    () => undefined,
  );
