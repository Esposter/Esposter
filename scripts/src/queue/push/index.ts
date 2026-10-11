import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { PUSHING_ENVIRONMENT_VARIABLE } from "#src/queue/push/constants";
import { runQueuePush } from "#src/queue/push/runQueuePush";
import { pushQueue } from "#src/services/queue/pushQueue";

// `pnpm ai:queue:push` — the session's side of the review queue's push, whatever state the shared checkout is in
// (the review-queue skill). The post-commit hook and a manual call both come here, so one push runs at a time
// The variable is inherited by every git the push runs, so the hook those git commits fire does not start another push
process.env[PUSHING_ENVIRONMENT_VARIABLE] = "1";
const outcome = await runQueuePush(pushQueue);
if (outcome === QueuePushOutcome.Pushed) console.info("pushed ai/queue");
else if (outcome === QueuePushOutcome.Queued) console.info("a push is running: this commit is queued behind it");
else console.info("the replay conflicted — nothing moved; settle it with git pull --rebase once the tree is clean");
