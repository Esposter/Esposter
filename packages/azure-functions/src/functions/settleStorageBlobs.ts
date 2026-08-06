import { settleStorageBlobsHandler } from "@/handlers/settleStorageBlobsHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.timer(AzureFunction.SettleStorageBlobs, {
  handler: settleStorageBlobsHandler,
  // Every 15 minutes. A hold is only released once its write SAS has expired (one hour), so the sweep is never
  // Racing an upload — the cadence only decides how long an abandoned hold keeps counting against its owner.
  schedule: "0 */15 * * * *",
});

export default {};
