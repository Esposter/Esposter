import { WebpageEditor, webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { SAVE_FILENAME } from "@@/server/services/webpageEditor/constants";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { jsonDateParse, streamToText } from "@esposter/shared";

export const webpageEditorRouter = router({
  readWebpageEditor: standardAuthedProcedure.query<WebpageEditor>(async ({ ctx }) => {
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
  saveWebpageEditor: standardAuthedProcedure.input(webpageEditorSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.WebpageEditorAssets, blobName, JSON.stringify(input));
  }),
});
