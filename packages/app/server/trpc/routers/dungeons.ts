import { uploadBlockBlob } from "@/server/services/azure/blob/uploadBlockBlob";
import { SAVE_FILENAME } from "@/server/services/dungeons/constants";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { useContainerClient } from "@/server/util/azure/useContainerClient";
import { AzureContainer } from "@/shared/models/azure/blob/AzureContainer";
import { Game, gameSchema } from "@/shared/models/dungeons/data/Game";
import { streamToText } from "@/shared/util/text/streamToText";
import { jsonDateParse } from "@/shared/util/time/jsonDateParse";

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
