import { AzureContainer } from "@/models/azure/blob";
import { EmailEditor, emailEditorSchema } from "@/models/emailEditor/EmailEditor";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/emailEditor/constants";
import { streamToText } from "@/util/text/streamToText";
import { jsonDateParse } from "@/util/time/jsonDateParse";

export const emailEditorRouter = router({
  readEmailEditor: authedProcedure.query<EmailEditor>(async ({ ctx }) => {
    try {
      const containerClient = await getContainerClient(AzureContainer.EmailEditorAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new EmailEditor();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new EmailEditor(), jsonDateParse(json));
    } catch {
      return undefined;
    }
  }),
  saveEmailEditor: authedProcedure.input(emailEditorSchema).mutation(async ({ ctx, input }) => {
    const client = await getContainerClient(AzureContainer.EmailEditorAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
