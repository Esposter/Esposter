import { drainDeadLetterContainer } from "#src/services/drainDeadLetterContainer";
import { app } from "@azure/functions";
import { getResultAsync, noop } from "@esposter/shared";

// A start hook rather than a function: nothing triggers this, and the app coming back is itself the signal it waits
// For. No `AzureFunction` member either — it is not an event type, so nothing subscribes to it and nothing may
// Replay it.
// Never allowed to reject. A start hook that throws is one that can stop the app registering its functions, which is
// The exact failure this drain exists to recover from — so a container that cannot be read leaves the app starting
// Normally and the blobs for the next start.
app.hook.appStart(() =>
  getResultAsync(drainDeadLetterContainer).match(noop, (error) => {
    console.error(`${drainDeadLetterContainer.name} failed:`, error);
  }),
);

export default {};
