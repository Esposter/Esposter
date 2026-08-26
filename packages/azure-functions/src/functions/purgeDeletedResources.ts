import { purgeDeletedResourcesHandler } from "#src/handlers/purgeDeletedResourcesHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.timer(AzureFunction.PurgeDeletedResources, {
  handler: purgeDeletedResourcesHandler,
  // Daily at 03:00 UTC — the retention window is 30 days, so the sweep only needs to be
  // Eventually timely, and an off-peak hour keeps it away from interactive load.
  schedule: "0 0 3 * * *",
  // The schedule monitor is a status blob the host polls for as long as it is alive, whether or not an
  // Occurrence is due - so a once-a-day sweep pays a round trip every few seconds to catch up a run it missed
  // While down. The retention window is 30 days and this is the only thing that reads it, so a skipped night
  // Is swept the next one; the poll is the only cost that is not eventually free
  useMonitor: false,
});

export default {};
