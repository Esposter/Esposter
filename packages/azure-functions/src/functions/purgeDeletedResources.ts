import { purgeDeletedResourcesHandler } from "@/handlers/purgeDeletedResourcesHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.timer(AzureFunction.PurgeDeletedResources, {
  handler: purgeDeletedResourcesHandler,
  // Daily at 03:00 UTC — the retention window is 30 days, so the sweep only needs to be
  // Eventually timely, and an off-peak hour keeps it away from interactive load.
  schedule: "0 0 3 * * *",
});

export default {};
