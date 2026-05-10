import { WebpageEditor, webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { SAVE_FILENAME } from "@@/server/services/webpageEditor/constants";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { getResultAsync, jsonDateParse, streamToText } from "@esposter/shared";

export const webpageEditorRouter = router({
  readWebpageEditor: standardAuthedProcedure.query<WebpageEditor>(({ ctx }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    return getResultAsync(async () => {
      const { readableStreamBody } = await useDownload(AzureContainer.WebpageEditorAssets, blobName);
      if (!readableStreamBody) return new WebpageEditor();
      const json = await streamToText(readableStreamBody);
      return new WebpageEditor(jsonDateParse(json));
    })
      .orTee(console.error)
      .unwrapOr(new WebpageEditor());
  }),
  saveWebpageEditor: standardAuthedProcedure.input(webpageEditorSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.WebpageEditorAssets, blobName, JSON.stringify(input));
  }),
});
