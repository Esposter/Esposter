import {
  TableEditorConfiguration,
  tableEditorConfigurationSchema,
} from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { SAVE_FILENAME } from "@@/server/services/tableEditor/constants";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { jsonDateParse, streamToText, toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

export const tableEditorRouter = router({
  readTableEditorConfiguration: standardAuthedProcedure.query<TableEditorConfiguration>(({ ctx }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    return ResultAsync.fromPromise(
      useDownload(AzureContainer.TableEditorAssets, blobName).then(async ({ readableStreamBody }) => {
        if (!readableStreamBody) return new TableEditorConfiguration();
        const json = await streamToText(readableStreamBody);
        return new TableEditorConfiguration(jsonDateParse(json));
      }),
      toAppError,
    )
      .tapErr(console.error)
      .unwrapOr(new TableEditorConfiguration());
  }),
  saveTableEditorConfiguration: standardAuthedProcedure
    .input(tableEditorConfigurationSchema)
    .mutation(async ({ ctx, input }) => {
      const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
      await useUpload(AzureContainer.TableEditorAssets, blobName, JSON.stringify(input));
    }),
});
