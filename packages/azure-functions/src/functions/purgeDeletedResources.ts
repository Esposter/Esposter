import { purgeDeletedResourcesHandler } from "#src/handlers/purgeDeletedResourcesHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.timer(AzureFunction.PurgeDeletedResources, {
  handler: purgeDeletedResourcesHandler,
  // Daily at 03:00 UTC — the retention window is 30 days, so the sweep only needs to be
  // Eventually timely, and an off-peak hour keeps it away from interactive load.
  schedule: "0 0 3 * * *",
  // What the monitor buys is past-due recovery: the host persists each occurrence to a status blob so a run
  // Missed while it was down fires on the next start. What it cost here was measured rather than assumed —
  // Storage analytics logging showed that blob being read several times a minute per app, around half of all
  // Blob reads on the account, for a function that runs once a day. Without it a missed night simply waits for
  // The next one, which the 30-day retention window absorbs and the handler's own expiry query then sweeps.
  useMonitor: false,
});

export default {};
