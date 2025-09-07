import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { WebpageEditor, webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { useDownload } from "@@/server/composables/azure/useDownload";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { SAVE_FILENAME } from "@@/server/services/webpageEditor/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { streamToText } from "@esposter/shared";

export const webpageEditorRouter = router({
  readWebpageEditor: authedProcedure.query<WebpageEditor>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const { readableStreamBody } = await useDownload(AzureContainer.WebpageEditorAssets, blobName);
      if (!readableStreamBody) return new WebpageEditor();

      const json = await streamToText(readableStreamBody);
      return new WebpageEditor(jsonDateParse(json));
    } catch {
      return new WebpageEditor();
    }
  }),
  saveWebpageEditor: authedProcedure.input(webpageEditorSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.WebpageEditorAssets, blobName, JSON.stringify(input));
  }),
});
