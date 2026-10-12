import { REVIEW_WORKFLOW_FILE } from "#src/services/review/constants";
import { QUEUE_BRANCH } from "#src/services/shared/constants";
import { runGh } from "#src/services/shared/runGh";

// Dispatches the review again on the queue, the one way a run wakes its own continuation while the workflow has no push
// Trigger. A range continuation names its own `from` and `to`, so the next run picks up where this one's window ended.
export const dispatchContinuation = (range?: { from: string; to: string }): void => {
  const inputs = range ? ["-f", `from=${range.from}`, "-f", `to=${range.to}`] : [];
  runGh(["workflow", "run", REVIEW_WORKFLOW_FILE, "--ref", QUEUE_BRANCH, ...inputs]);
};
