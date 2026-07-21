import { processBlobDeletionHandler } from "@/handlers/processBlobDeletionHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ProcessBlobDeletion, {
  handler: processBlobDeletionHandler,
});

export default {};
