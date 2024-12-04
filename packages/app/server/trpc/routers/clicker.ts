import { BuildingMap } from "#shared/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "#shared/assets/clicker/data/upgrades/UpgradeMap";
import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { ClickerGame, clickerGameSchema } from "#shared/models/clicker/data/ClickerGame";
import { streamToText } from "#shared/util/text/streamToText";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { uploadBlockBlob } from "@@/server/services/azure/blob/uploadBlockBlob";
import { SAVE_FILENAME } from "@@/server/services/clicker/constants";
import { publicProcedure, router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { useContainerClient } from "@@/server/util/azure/useContainerClient";

export const clickerRouter = router({
  readBuildingMap: publicProcedure.query(() => BuildingMap),
  readGame: authedProcedure.query<ClickerGame>(async ({ ctx }) => {
    try {
      const containerClient = await useContainerClient(AzureContainer.ClickerAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new ClickerGame();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new ClickerGame(), jsonDateParse(json));
    } catch {
      return new ClickerGame();
    }
  }),
  readUpgradeMap: publicProcedure.query(() => UpgradeMap),
  saveGame: authedProcedure.input(clickerGameSchema).mutation(async ({ ctx, input }) => {
    const client = await useContainerClient(AzureContainer.ClickerAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
