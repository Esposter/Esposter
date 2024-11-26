import {
  TableEditorConfiguration,
  tableEditorConfigurationSchema,
} from "@/models/tableEditor/TableEditorConfiguration";
import { uploadBlockBlob } from "@/server/services/azure/blob/uploadBlockBlob";
import { SAVE_FILENAME } from "@/server/services/tableEditor/constants";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { useContainerClient } from "@/server/util/azure/useContainerClient";
import { AzureContainer } from "@/shared/models/azure/blob/AzureContainer";
import { jsonDateParse } from "@/shared/util/time/jsonDateParse";
import { streamToText } from "@/util/text/streamToText";

export const tableEditorRouter = router({
  readTableEditor: authedProcedure.query<TableEditorConfiguration>(async ({ ctx }) => {
    try {
      const containerClient = await useContainerClient(AzureContainer.TableEditorAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new TableEditorConfiguration();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new TableEditorConfiguration(), jsonDateParse(json));
    } catch {
      // We need to catch the case where the user is reading for the very first time
      // and there is no table editor configuration saved yet
      return new TableEditorConfiguration();
    }
  }),
  saveTableEditor: authedProcedure.input(tableEditorConfigurationSchema).mutation(async ({ ctx, input }) => {
    const client = await useContainerClient(AzureContainer.TableEditorAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
