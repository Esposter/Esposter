import { WebpageEditor, webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { SAVE_FILENAME } from "@@/server/services/webpageEditor/constants";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { jsonDateParse, streamToText, toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

export const webpageEditorRouter = router({
  readWebpageEditor: standardAuthedProcedure.query<WebpageEditor>(({ ctx }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    return ResultAsync.fromPromise(
      useDownload(AzureContainer.WebpageEditorAssets, blobName).then(async ({ readableStreamBody }) => {
        if (!readableStreamBody) return new WebpageEditor();
        const json = await streamToText(readableStreamBody);
        return new WebpageEditor(jsonDateParse(json));
      }),
      toAppError,
    )
      .orTee(console.error)
      .unwrapOr(new WebpageEditor());
  }),
  saveWebpageEditor: standardAuthedProcedure.input(webpageEditorSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.WebpageEditorAssets, blobName, JSON.stringify(input));
  }),
});
