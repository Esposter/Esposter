import { QueuePushOutcome } from "#src/models/queue/QueuePushOutcome";
import { pushQueue } from "#src/services/queue/pushQueue";

// `pnpm ai:queue:push` — the session's side of the review queue's push, whatever state the shared checkout is in
// (the review-queue skill)
const outcome = pushQueue();
if (outcome === QueuePushOutcome.Pushed) console.info("pushed ai/queue");
else console.info("the replay conflicted — nothing moved; settle it with git pull --rebase once the tree is clean");
