import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { streamToText } from "#shared/util/text/streamToText";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { useDownload } from "@@/server/composables/azure/useDownload";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { SAVE_FILENAME } from "@@/server/services/dungeons/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";

export const dungeonsRouter = router({
  readDungeons: authedProcedure.query<Dungeons>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const { readableStreamBody } = await useDownload(AzureContainer.DungeonsAssets, blobName);
      if (!readableStreamBody) return new Dungeons();

      const json = await streamToText(readableStreamBody);
      return Object.assign(new Dungeons(), jsonDateParse(json));
    } catch {
      return new Dungeons();
    }
  }),
  saveDungeons: authedProcedure.input(dungeonsSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.ClickerAssets, blobName, JSON.stringify(input));
  }),
});
