import { EmailEditor, emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { SAVE_FILENAME } from "@@/server/services/emailEditor/constants";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { jsonDateParse, streamToText } from "@esposter/shared";

export const emailEditorRouter = router({
  readEmailEditor: standardAuthedProcedure.query<EmailEditor>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const { readableStreamBody } = await useDownload(AzureContainer.EmailEditorAssets, blobName);
      if (!readableStreamBody) return new EmailEditor();

      const json = await streamToText(readableStreamBody);
      return new EmailEditor(jsonDateParse(json));
    } catch {
      return new EmailEditor();
    }
  }),
  saveEmailEditor: standardAuthedProcedure.input(emailEditorSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.EmailEditorAssets, blobName, JSON.stringify(input));
  }),
});
