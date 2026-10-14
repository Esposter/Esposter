import { REMOTE_QUEUE_REF, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { runGit } from "#src/services/shared/runGit";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The queue checkout is forced and cleaned, which discards whatever the checkout held: a run started from a checkout
// Other sessions work in would take their uncommitted edits, their untracked files and their unpushed commits with it.
// So a run refuses to start unless there is nothing of that to lose, and a hand run belongs in a checkout of its own.
// Called once, after the fetch, before the first checkout: what a settler leaves behind is the run's own to discard.
export const assertCheckoutIsDisposable = (cwd: string = REPOSITORY_ROOT): void => {
  const changes = runGit(["status", "--porcelain"], cwd).trim();
  const unpushed = runGit(["log", "--oneline", `${REMOTE_QUEUE_REF}..HEAD`], cwd).trim();
  if (!changes && !unpushed) return;
  throw new InvalidOperationError(
    Operation.Delete,
    assertCheckoutIsDisposable.name,
    [
      "The review resets this checkout to the queue's tip, which would discard:",
      changes,
      unpushed,
      "Run it from a checkout of its own.",
    ]
      .filter(Boolean)
      .join("\n"),
  );
};
