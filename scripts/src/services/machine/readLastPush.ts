import type { LastPush } from "#src/models/shared/LastPush";

import { REMOTE_QUEUE_REF } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// The last commit this machine's git identity landed on the queue as origin holds it, or undefined when it has landed
// None. An unset identity or a missing queue ref is that answer too: a machine with no identity cannot have pushed
export const readLastPush = (): LastPush | undefined =>
  getResult(() => {
    const author = runGit(["config", "user.name"]).trim();
    const line = runGit(["log", "-1", "--format=%H %aI", `--author=${author}`, REMOTE_QUEUE_REF]).trim();
    const [sha, at] = line.split(" ");
    return sha === undefined || at === undefined ? undefined : { at, sha };
  }).match(
    (lastPush) => lastPush,
    () => undefined,
  );
