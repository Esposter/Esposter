import { buildings } from "@/assets/clicker/data/buildings";
import { cursorUpgrades } from "@/assets/clicker/data/upgrades/cursor";
import { grandmaUpgrades } from "@/assets/clicker/data/upgrades/grandma";
import { AzureContainer } from "@/models/azure/blob";
import { Game, gameSchema } from "@/models/clicker/Game";
import { Upgrade } from "@/models/clicker/Upgrade";
import { router } from "@/server/trpc";
import { authedProcedure, rateLimitedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/clicker/constants";
import { streamToText } from "@/utils/text";

export const clickerRouter = router({
  readUpgrades: rateLimitedProcedure.query<Upgrade[]>(() => [...cursorUpgrades, ...grandmaUpgrades] as Upgrade[]),
  readBuildings: rateLimitedProcedure.query(() => buildings),
  readGame: authedProcedure.query<Game>(async ({ ctx }) => {
    try {
      const containerClient = await getContainerClient(AzureContainer.ClickerAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new Game();
      return jsonDateParse(await streamToText(response.readableStreamBody));
    } catch {
      // We need to catch the case where the user is reading for the very first time
      // and there is no game saved yet
      return new Game();
    }
  }),
  saveGame: authedProcedure.input(gameSchema).mutation(async ({ input, ctx }) => {
    const client = await getContainerClient(AzureContainer.ClickerAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
