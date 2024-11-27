import { uploadBlockBlob } from "@/server/services/azure/blob/uploadBlockBlob";
import { SAVE_FILENAME } from "@/server/services/webpageEditor/constants";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { useContainerClient } from "@/server/util/azure/useContainerClient";
import { AzureContainer } from "@/shared/models/azure/blob/AzureContainer";
import { WebpageEditor, webpageEditorSchema } from "@/shared/models/webpageEditor/data/WebpageEditor";
import { streamToText } from "@/shared/util/text/streamToText";
import { jsonDateParse } from "@/shared/util/time/jsonDateParse";

export const webpageEditorRouter = router({
  readWebpageEditor: authedProcedure.query<WebpageEditor>(async ({ ctx }) => {
    try {
      const containerClient = await useContainerClient(AzureContainer.WebpageEditorAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new WebpageEditor();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new WebpageEditor(), jsonDateParse(json));
    } catch {
      return undefined;
    }
  }),
  saveWebpageEditor: authedProcedure.input(webpageEditorSchema).mutation(async ({ ctx, input }) => {
    const client = await useContainerClient(AzureContainer.WebpageEditorAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
