import { AzureContainer } from "@/models/azure/blob";
import { WebpageEditor, webpageEditorSchema } from "@/models/webpageEditor/WebpageEditor";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/webpageEditor/constants";
import { streamToText } from "@/util/text/streamToText";
import { jsonDateParse } from "@/util/time/jsonDateParse";

export const webpageEditorRouter = router({
  readWebpageEditor: authedProcedure.query<WebpageEditor>(async ({ ctx }) => {
    try {
      const containerClient = await getContainerClient(AzureContainer.WebpageEditorAssets);
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
    const client = await getContainerClient(AzureContainer.WebpageEditorAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
