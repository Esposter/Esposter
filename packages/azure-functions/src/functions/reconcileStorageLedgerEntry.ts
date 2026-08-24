import { reconcileStorageLedgerEntryHandler } from "#src/handlers/reconcileStorageLedgerEntryHandler";
import { app } from "@azure/functions";
import { AzureFunction } from "@esposter/db-schema";

app.eventGrid(AzureFunction.ReconcileStorageLedgerEntry, { handler: reconcileStorageLedgerEntryHandler });

export default {};
