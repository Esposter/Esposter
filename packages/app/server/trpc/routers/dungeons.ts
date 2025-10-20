import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { SAVE_FILENAME } from "@@/server/services/dungeons/constants";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { jsonDateParse, streamToText } from "@esposter/shared";

export const dungeonsRouter = router({
  readDungeons: standardAuthedProcedure.query<Dungeons>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const { readableStreamBody } = await useDownload(AzureContainer.DungeonsAssets, blobName);
      if (!readableStreamBody) return new Dungeons();

      const json = await streamToText(readableStreamBody);
      return new Dungeons(jsonDateParse(json));
    } catch {
      return new Dungeons();
    }
  }),
  saveDungeons: standardAuthedProcedure.input(dungeonsSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.DungeonsAssets, blobName, JSON.stringify(input));
  }),
});
