import { AzureContainer } from "@/models/azure/blob";
import { Game, gameSchema } from "@/models/dungeons/data/Game";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/dungeons/constants";
import { streamToText } from "@/util/text/streamToText";
import { jsonDateParse } from "@/util/time/jsonDateParse";

export const dungeonsRouter = router({
  readGame: authedProcedure.query<Game>(async ({ ctx }) => {
    try {
      const containerClient = await getContainerClient(AzureContainer.DungeonsAssets);
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
  saveGame: authedProcedure.input(gameSchema).mutation(async ({ ctx, input }) => {
    const client = await getContainerClient(AzureContainer.ClickerAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
