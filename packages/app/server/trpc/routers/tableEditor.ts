import {
    TableEditorConfiguration,
    tableEditorConfigurationSchema,
} from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { useDownload } from "@@/server/composables/azure/useDownload";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { SAVE_FILENAME } from "@@/server/services/tableEditor/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { jsonDateParse, streamToText } from "@esposter/shared";

export const tableEditorRouter = router({
  readTableEditorConfiguration: authedProcedure.query<TableEditorConfiguration>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const { readableStreamBody } = await useDownload(AzureContainer.TableEditorAssets, blobName);
      if (!readableStreamBody) return new TableEditorConfiguration();

      const json = await streamToText(readableStreamBody);
      return new TableEditorConfiguration(jsonDateParse(json));
    } catch {
      return new TableEditorConfiguration();
    }
  }),
  saveTableEditorConfiguration: authedProcedure
    .input(tableEditorConfigurationSchema)
    .mutation(async ({ ctx, input }) => {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      await useUpload(AzureContainer.TableEditorAssets, blobName, JSON.stringify(input));
    }),
});
