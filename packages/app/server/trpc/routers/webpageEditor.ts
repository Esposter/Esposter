import { WebpageEditor, webpageEditorSchema } from "@/models/webpageEditor/WebpageEditor";
import { uploadBlockBlob } from "@/server/services/azure/blob/uploadBlockBlob";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { SAVE_FILENAME } from "@/services/webpageEditor/constants";
import { AzureContainer } from "@/shared/models/azure/blob/AzureContainer";
import { jsonDateParse } from "@/shared/utils/time/jsonDateParse";
import { streamToText } from "@/util/text/streamToText";

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
