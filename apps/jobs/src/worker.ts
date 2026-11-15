// The Workers runtime has no Temporal yet, and modules read it as they load, so the polyfill installs it before any other import
import "temporal-polyfill/global";
import { handleCutoverRequest } from "#src/services/cutover/handleCutoverRequest";
import { validateJobsEnvironment } from "#src/services/environment/validateJobsEnvironment";
import { handleQueueBatch } from "#src/services/queue/handleQueueBatch";
import { purgeExpiredResources } from "#src/services/resource/purgeExpiredResources";
import { getResultAsync, noop } from "@esposter/shared";

// The jobs Worker is a queue consumer for every job and for each job's dead-letter queue.
// It also runs the nightly purge on its Cron Trigger.
// The realtime objects it reaches are bound through the realtime Worker's name, so they are not exported from here.
// Its only HTTP routes are the cutover's three temporary internal routes, all deleted at teardown.
// They are the reschedule, and the import and summary of a copied room history.
// (openspec/changes/infra-cloudflare-cutover/design.md)
export default {
  fetch: (request, env) => handleCutoverRequest(request, env, validateJobsEnvironment().CUTOVER_SECRET),
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
