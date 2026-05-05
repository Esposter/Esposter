import { Dungeons, dungeonsSchema } from "#shared/models/dungeons/data/Dungeons";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { SAVE_FILENAME } from "@@/server/services/dungeons/constants";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { jsonDateParse, streamToText, toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

export const dungeonsRouter = router({
  readDungeons: standardAuthedProcedure.query<Dungeons>(({ ctx }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    return ResultAsync.fromPromise(
      useDownload(AzureContainer.DungeonsAssets, blobName).then(async ({ readableStreamBody }) => {
        if (!readableStreamBody) return new Dungeons();
        const json = await streamToText(readableStreamBody);
        return new Dungeons(jsonDateParse(json));
      }),
      toAppError,
    )
      .tapErr(console.error)
      .unwrapOr(new Dungeons());
  }),
  saveDungeons: standardAuthedProcedure.input(dungeonsSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.DungeonsAssets, blobName, JSON.stringify(input));
  }),
});
