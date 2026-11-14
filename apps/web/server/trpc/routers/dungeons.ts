import { router } from "#server/trpc";
import { createReadBlobStateProcedure } from "#server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "#server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { saveDungeonsInputSchema } from "#shared/models/db/dungeons/SaveDungeonsInput";
import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { StorageBucket } from "@esposter/db-schema";

export const dungeonsRouter = router({
  readDungeons: createReadBlobStateProcedure(StorageBucket.UserAssets, Dungeons, dungeonsSchema),
  saveDungeons: createSaveBlobStateProcedure(StorageBucket.UserAssets, saveDungeonsInputSchema),
});
