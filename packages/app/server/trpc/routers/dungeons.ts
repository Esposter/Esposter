import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { DungeonsGame, dungeonsGameSchema } from "#shared/models/dungeons/data/DungeonsGame";
import { streamToText } from "#shared/util/text/streamToText";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { uploadBlockBlob } from "@@/server/services/azure/blob/uploadBlockBlob";
import { SAVE_FILENAME } from "@@/server/services/dungeons/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { useContainerClient } from "@@/server/util/azure/useContainerClient";

export const dungeonsRouter = router({
  readGame: authedProcedure.query<DungeonsGame>(async ({ ctx }) => {
    try {
      const containerClient = await useContainerClient(AzureContainer.DungeonsAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new DungeonsGame();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new DungeonsGame(), jsonDateParse(json));
    } catch {
      return new DungeonsGame();
    }
  }),
  saveGame: authedProcedure.input(dungeonsGameSchema).mutation(async ({ ctx, input }) => {
    const client = await useContainerClient(AzureContainer.ClickerAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
