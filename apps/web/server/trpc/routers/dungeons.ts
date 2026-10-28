import { router } from "#server/trpc";
import { createReadBlobStateProcedure } from "#server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "#server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { saveDungeonsInputSchema } from "#shared/models/db/dungeons/SaveDungeonsInput";
import { Dungeons } from "#shared/models/dungeons/data/Dungeons";
import { AzureContainer } from "@esposter/db-schema";

export const dungeonsRouter = router({
  readDungeons: createReadBlobStateProcedure(AzureContainer.UserAssets, Dungeons),
  saveDungeons: createSaveBlobStateProcedure(AzureContainer.UserAssets, saveDungeonsInputSchema),
});
