ALTER TABLE "storageBlobs" RENAME TO "storageLedger";--> statement-breakpoint
ALTER TABLE "storageLedger" RENAME CONSTRAINT "storageBlobs_declaredBytes_check" TO "storageLedger_declaredBytes_check";--> statement-breakpoint
ALTER TABLE "storageLedger" RENAME CONSTRAINT "storageBlobs_countedBytes_check" TO "storageLedger_countedBytes_check";--> statement-breakpoint
ALTER INDEX "storageBlobs_userId_reconciledAt_index" RENAME TO "storageLedger_userId_reconciledAt_index";