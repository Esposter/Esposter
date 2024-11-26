import { Game, gameSchema } from "@/models/clicker/data/Game";
import { BuildingMap } from "@/server/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "@/server/assets/clicker/data/upgrades/UpgradeMap";
import { uploadBlockBlob } from "@/server/services/azure/blob/uploadBlockBlob";
import { SAVE_FILENAME } from "@/server/services/clicker/constants";
import { publicProcedure, router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { useContainerClient } from "@/server/util/azure/useContainerClient";
import { AzureContainer } from "@/shared/models/azure/blob/AzureContainer";
import { jsonDateParse } from "@/shared/util/time/jsonDateParse";
import { streamToText } from "@/util/text/streamToText";

export const clickerRouter = router({
  readBuildingMap: publicProcedure.query(() => BuildingMap),
  readGame: authedProcedure.query<Game>(async ({ ctx }) => {
    try {
      const containerClient = await useContainerClient(AzureContainer.ClickerAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new Game();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new Game(), jsonDateParse(json));
    } catch {
      return new Game();
    }
  }),
  readUpgradeMap: publicProcedure.query(() => UpgradeMap),
  saveGame: authedProcedure.input(gameSchema).mutation(async ({ ctx, input }) => {
    const client = await useContainerClient(AzureContainer.ClickerAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
