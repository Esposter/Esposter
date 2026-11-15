import { router } from "#server/trpc/index";
import { createReadBlobStateProcedure } from "#server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "#server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { saveDungeonsInputSchema } from "#shared/models/db/dungeons/SaveDungeonsInput";
import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { StorageBucket, TopicKind } from "@esposter/db-schema";

export const dungeonsRouter = router({
  readDungeons: createReadBlobStateProcedure(StorageBucket.UserAssets, Dungeons, dungeonsSchema, TopicKind.Dungeons),
  saveDungeons: createSaveBlobStateProcedure(StorageBucket.UserAssets, saveDungeonsInputSchema, TopicKind.Dungeons),
});
