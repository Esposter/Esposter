import { QUEUE_BRANCH } from "#src/services/shared/constants";
import { runGh } from "#src/services/shared/runGh";

// Starts a steady review run on `ai/queue`, through the collector's token, which a dispatch needs no other permission for.
// The review's concurrency group folds it into any run already waiting.
export const dispatchReview = (): void => {
  runGh(["workflow", "run", "Review.yaml", "--ref", QUEUE_BRANCH]);
};
