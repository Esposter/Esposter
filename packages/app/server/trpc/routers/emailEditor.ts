import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { EmailEditor, emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { streamToText } from "#shared/util/text/streamToText";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { useDownload } from "@@/server/composables/azure/useDownload";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { SAVE_FILENAME } from "@@/server/services/emailEditor/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";

export const emailEditorRouter = router({
  readEmailEditor: authedProcedure.query<EmailEditor>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const { readableStreamBody } = await useDownload(AzureContainer.EmailEditorAssets, blobName);
      if (!readableStreamBody) return new EmailEditor();

      const json = await streamToText(readableStreamBody);
      return Object.assign(new EmailEditor(), jsonDateParse(json));
    } catch {
      return new EmailEditor();
    }
  }),
  saveEmailEditor: authedProcedure.input(emailEditorSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.EmailEditorAssets, blobName, JSON.stringify(input));
  }),
});
