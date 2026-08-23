import { reconcileStorageBlobHandler } from "#src/handlers/reconcileStorageBlobHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ReconcileStorageBlob, { handler: reconcileStorageBlobHandler });

export default {};
