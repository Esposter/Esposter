import { handleCutoverRequest } from "#src/services/cutover/handleCutoverRequest";
import { validateFunctionsEnvironment } from "#src/services/environment/validateFunctionsEnvironment";
import { handleQueueBatch } from "#src/services/queue/handleQueueBatch";
import { purgeExpiredResources } from "#src/services/resource/purgeExpiredResources";
import { getResultAsync, noop } from "@esposter/shared";

// The Scheduler is a Durable Object class this Worker exports and binds to itself, so its alarm can send a job to the queue
export { Scheduler } from "#src/durableObjects/Scheduler";

// The functions Worker: a queue consumer for every job, and the nightly purge on its Cron Trigger. Its one HTTP route is
// the cutover's temporary reschedule, which is deleted at teardown (openspec/changes/infra-cloudflare-cutover/design.md)
export default {
  fetch: (request, env) => handleCutoverRequest(request, env),
  queue: (batch) => {
    return handleQueueBatch(batch, validateFunctionsEnvironment().CLOUDFLARE_ENVIRONMENT);
  },
  scheduled: (_controller, _env, context) => {
    validateFunctionsEnvironment();
    // A run that fails is logged and waits for the next night: the purge is eventually timely, and a Cron Trigger has no
    // retry of its own to ask for
    context.waitUntil(
      getResultAsync(purgeExpiredResources).match(noop, (error) => {
        console.error("PurgeDeletedResources failed: ", error);
      }),
    );
  },
} satisfies ExportedHandler<Cloudflare.Env>;
