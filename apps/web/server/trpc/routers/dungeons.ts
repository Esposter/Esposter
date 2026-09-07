import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { router } from "@@/server/trpc";
import { createReadBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { AzureContainer } from "@esposter/db-schema";

export const dungeonsRouter = router({
  readDungeons: createReadBlobStateProcedure(AzureContainer.DungeonsAssets, Dungeons),
  saveDungeons: createSaveBlobStateProcedure(AzureContainer.DungeonsAssets, dungeonsSchema),
});
