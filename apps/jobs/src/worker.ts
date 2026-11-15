// The Workers runtime has no Temporal yet, and modules read it as they load, so the polyfill installs it before any other import
import "temporal-polyfill/global";
import { validateJobsEnvironment } from "#src/services/environment/validateJobsEnvironment";
import { handleQueueBatch } from "#src/services/queue/handleQueueBatch";
import { purgeExpiredResources } from "#src/services/resource/purgeExpiredResources";
import { getResultAsync, noop } from "@esposter/shared";

// The jobs Worker is a queue consumer for every job and for each job's dead-letter queue.
// It also runs the nightly purge on its Cron Trigger.
// The realtime objects it reaches are bound through the realtime Worker's name, so they are not exported from here.
// This Worker serves no HTTP, so every request it is sent is answered with a 404
export default {
  fetch: () => new Response(null, { status: 404 }),
  queue: (batch) => handleQueueBatch(batch, validateJobsEnvironment().CLOUDFLARE_ENVIRONMENT),
  scheduled: (_controller, _env, context) => {
    validateJobsEnvironment();
    // A run that fails is logged and waits for the next night: the purge is eventually timely.
    // A Cron Trigger has no retry of its own to ask for.
    context.waitUntil(
      getResultAsync(purgeExpiredResources).match(noop, (error) => {
        console.error("PurgeDeletedResources failed:", error);
      }),
    );
  },
} satisfies ExportedHandler<Cloudflare.Env>;
