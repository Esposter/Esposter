import { BuildingMap } from "@/assets/clicker/data/BuildingMap";
import { UpgradeMap } from "@/assets/clicker/data/upgrades/UpgradeMap";
import { AzureContainer } from "@/models/azure/blob";
import { Game, gameSchema } from "@/models/clicker/data/Game";
import { router } from "@/server/trpc";
import { authedProcedure, rateLimitedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/clicker/constants";
import { streamToText } from "@/util/text/streamToText";
import { jsonDateParse } from "@/util/time/jsonDateParse";

export const clickerRouter = router({
  readBuildingMap: rateLimitedProcedure.query(() => BuildingMap),
  readGame: authedProcedure.query<Game>(async ({ ctx }) => {
    try {
      const containerClient = await getContainerClient(AzureContainer.ClickerAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new Game();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new Game(), jsonDateParse(json));
    } catch {
      // We need to catch the case where the user is reading for the very first time
      // and there is no game saved yet
      return new Game();
    }
  }),
  readUpgradeMap: rateLimitedProcedure.query(() => UpgradeMap),
  saveGame: authedProcedure.input(gameSchema).mutation(async ({ ctx, input }) => {
    const client = await getContainerClient(AzureContainer.ClickerAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
