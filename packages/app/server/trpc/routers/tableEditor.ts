import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import {
  TableEditorConfiguration,
  tableEditorConfigurationSchema,
} from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { streamToText } from "#shared/util/text/streamToText";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { useDownload } from "@@/server/composables/azure/useDownload";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { SAVE_FILENAME } from "@@/server/services/tableEditor/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";

export const tableEditorRouter = router({
  readTableEditorConfiguration: authedProcedure.query<TableEditorConfiguration>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const { readableStreamBody } = await useDownload(AzureContainer.TableEditorAssets, blobName);
      if (!readableStreamBody) return new TableEditorConfiguration();

      const json = await streamToText(readableStreamBody);
      return Object.assign(new TableEditorConfiguration(), jsonDateParse(json));
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
