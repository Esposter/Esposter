import { Game, gameSchema } from "@/models/dungeons/data/Game";
import { uploadBlockBlob } from "@/server/services/azure/blob/uploadBlockBlob";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { SAVE_FILENAME } from "@/services/dungeons/constants";
import { AzureContainer } from "@/shared/models/azure/blob/AzureContainer";
import { jsonDateParse } from "@/shared/utils/time/jsonDateParse";
import { streamToText } from "@/util/text/streamToText";

export const dungeonsRouter = router({
  readGame: authedProcedure.query<Game>(async ({ ctx }) => {
    try {
      const containerClient = await useContainerClient(AzureContainer.DungeonsAssets);
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
    const client = await useContainerClient(AzureContainer.ClickerAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
