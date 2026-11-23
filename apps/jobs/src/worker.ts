// The Workers runtime has no Temporal yet, and modules read it as they load, so the polyfill installs it before any
// Other import
import "temporal-polyfill/global";
import { validateJobsEnvironment } from "#src/services/environment/validateJobsEnvironment";
import { handleQueueBatch } from "#src/services/queue/handleQueueBatch";
import { purgeExpiredQuarantine } from "#src/services/queue/purgeExpiredQuarantine";
import { purgeExpiredResources } from "#src/services/resource/purgeExpiredResources";
import { runUnit } from "#src/services/shared/runUnit";
import { purgeExpiredTombstones } from "#src/services/tombstone/purgeExpiredTombstones";
import { getResultAsync, noop } from "@esposter/shared";

// The nightly purges, each logged under its name when it fails, so one that fails is logged and the others still run.
// The recycle bin's purge runs as a unit, so the topics its deletes change are published. The tombstone and quarantine
// Purges change no view and publish nothing, so they run bare
const NIGHTLY_PURGES: { name: string; purge: () => Promise<void> }[] = [
  { name: "PurgeDeletedResources", purge: () => runUnit(purgeExpiredResources) },
  { name: "PurgeExpiredTombstones", purge: purgeExpiredTombstones },
  { name: "PurgeExpiredQuarantine", purge: purgeExpiredQuarantine },
];

// The jobs Worker is a queue consumer for every job and for each job's dead-letter queue.
// It also runs the nightly purges, of the recycle bin, of the overlay's tombstones and of quarantined dead letters,
// On its Cron Trigger.
// The realtime objects it reaches are bound through the realtime Worker's name, so they are not exported from here.
// This Worker serves no HTTP, so every request it is sent is answered with a 404
export default {
  fetch: () => new Response(null, { status: 404 }),
  queue: (batch) => handleQueueBatch(batch, validateJobsEnvironment().CLOUDFLARE_ENVIRONMENT),
  scheduled: (_controller, _env, context) => {
    validateJobsEnvironment();
    // A run that fails is logged and waits for the next night: the purge is eventually timely.
    // A Cron Trigger has no retry of its own to ask for.
    for (const { name, purge } of NIGHTLY_PURGES)
      context.waitUntil(
        getResultAsync(purge).match(noop, (error) => {
          console.error(`${name} failed:`, error);
        }),
      );
  },
} satisfies ExportedHandler<Cloudflare.Env>;
