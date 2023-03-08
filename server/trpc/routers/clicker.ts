import { buildings } from "@/assets/clicker/data/buildings";
import { cursorUpgrades } from "@/assets/clicker/data/upgrades/cursor";
import { grandmaUpgrades } from "@/assets/clicker/data/upgrades/grandma";
import { AzureContainer } from "@/models/azure/blob";
import type { Game } from "@/models/clicker/Game";
import { gameSchema } from "@/models/clicker/Game";
import { Upgrade } from "@/models/clicker/Upgrade";
import { router } from "@/server/trpc";
import { authedProcedure, rateLimitedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { createInitialGame } from "@/services/clicker/createInitialGame";
import { SAVE_FILENAME } from "@/services/clicker/settings";
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
      if (!response.readableStreamBody) return createInitialGame();
      return JSON.parse(await streamToText(response.readableStreamBody));
    } catch {
      return createInitialGame();
    }
  }),
  saveGame: authedProcedure.input(gameSchema).mutation(async ({ input, ctx }) => {
    try {
      const client = await getContainerClient(AzureContainer.ClickerAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      await uploadBlockBlob(client, blobName, JSON.stringify(input));
      return true;
    } catch {
      return false;
    }
  }),
});
