import { EmailEditor, emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { SAVE_FILENAME } from "@@/server/services/emailEditor/constants";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { jsonDateParse, streamToText, toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

export const emailEditorRouter = router({
  readEmailEditor: standardAuthedProcedure.query<EmailEditor>(({ ctx }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    return ResultAsync.fromPromise(
      useDownload(AzureContainer.EmailEditorAssets, blobName).then(async ({ readableStreamBody }) => {
        if (!readableStreamBody) return new EmailEditor();
        const json = await streamToText(readableStreamBody);
        return new EmailEditor(jsonDateParse(json));
      }),
      toAppError,
    )
      .orTee(console.error)
      .unwrapOr(new EmailEditor());
  }),
  saveEmailEditor: standardAuthedProcedure.input(emailEditorSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.EmailEditorAssets, blobName, JSON.stringify(input));
  }),
});
