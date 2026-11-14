// The Workers runtime has no Temporal yet, and modules read it as they load, so the polyfill installs it before any other import
import "temporal-polyfill/global";
import { handleCutoverRequest } from "#src/services/cutover/handleCutoverRequest";
import { validateFunctionsEnvironment } from "#src/services/environment/validateFunctionsEnvironment";
import { handleQueueBatch } from "#src/services/queue/handleQueueBatch";
import { purgeExpiredResources } from "#src/services/resource/purgeExpiredResources";
import { getResultAsync, noop } from "@esposter/shared";

// The realtime objects, one per room, call and person.
// The web Worker reaches each through its binding, which is named by the functions Worker that exports it.
// The queue consumers reach them through their own bindings.
export { CallObject } from "#src/durableObjects/CallObject";
export { RoomObject } from "#src/durableObjects/RoomObject";
export { UserObject } from "#src/durableObjects/UserObject";

// The functions Worker is a queue consumer for every job and for each job's dead-letter queue.
// It also runs the nightly purge on its Cron Trigger.
// Its only HTTP routes are the cutover's three temporary internal routes, all deleted at teardown.
// They are the reschedule, and the import and summary of a copied room history.
// (openspec/changes/infra-cloudflare-cutover/design.md)
export default {
  fetch: (request, env) => handleCutoverRequest(request, env),
  queue: (batch) => handleQueueBatch(batch, validateFunctionsEnvironment().CLOUDFLARE_ENVIRONMENT),
  scheduled: (_controller, _env, context) => {
    validateFunctionsEnvironment();
    // A run that fails is logged and waits for the next night: the purge is eventually timely.
    // A Cron Trigger has no retry of its own to ask for.
    context.waitUntil(
      getResultAsync(purgeExpiredResources).match(noop, (error) => {
        console.error("PurgeDeletedResources failed:", error);
      }),
    );
  },
} satisfies ExportedHandler<Cloudflare.Env>;
