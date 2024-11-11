import { EmailEditor, emailEditorSchema } from "@/models/emailEditor/EmailEditor";
import { uploadBlockBlob } from "@/server/services/azure/blob/uploadBlockBlob";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { SAVE_FILENAME } from "@/services/emailEditor/constants";
import { AzureContainer } from "@/shared/models/azure/blob/AzureContainer";
import { jsonDateParse } from "@/shared/utils/time/jsonDateParse";
import { streamToText } from "@/util/text/streamToText";

export const emailEditorRouter = router({
  readEmailEditor: authedProcedure.query<EmailEditor>(async ({ ctx }) => {
    try {
      const containerClient = await useContainerClient(AzureContainer.EmailEditorAssets);
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
    const client = await useContainerClient(AzureContainer.EmailEditorAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
