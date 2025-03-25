import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { DungeonsGame, dungeonsGameSchema } from "#shared/models/dungeons/data/DungeonsGame";
import { streamToText } from "#shared/util/text/streamToText";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { useDownload } from "@@/server/composables/azure/useDownload";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { SAVE_FILENAME } from "@@/server/services/dungeons/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";

export const dungeonsRouter = router({
  readGame: authedProcedure.query<DungeonsGame>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const response = await useDownload(AzureContainer.DungeonsAssets, blobName);
      if (!response.readableStreamBody) return new DungeonsGame();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new DungeonsGame(), jsonDateParse(json));
    } catch {
      return new DungeonsGame();
    }
  }),
  saveGame: authedProcedure.input(dungeonsGameSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.ClickerAssets, blobName, JSON.stringify(input));
  }),
});
