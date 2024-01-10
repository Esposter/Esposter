import { AzureContainer } from "@/models/azure/blob";
import { Game, gameSchema } from "@/models/dungeons/Game";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/dungeons/constants";
import { jsonDateParse } from "@/util/jsonDateParse";
import { streamToText } from "@/util/text/streamToText";

export const dungeonsRouter = router({
  readGame: authedProcedure.query<Game>(async ({ ctx }) => {
    try {
      const containerClient = await getContainerClient(AzureContainer.DungeonsAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new Game();

      const json = await streamToText(response.readableStreamBody);
      return new Game(jsonDateParse(json));
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
