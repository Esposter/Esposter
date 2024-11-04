import { AzureContainer } from "@/models/azure/blob";
import {
  TableEditorConfiguration,
  tableEditorConfigurationSchema,
} from "@/models/tableEditor/TableEditorConfiguration";
import { uploadBlockBlob } from "@/server/services/azure/blob/uploadBlockBlob";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { SAVE_FILENAME } from "@/services/clicker/constants";
import { streamToText } from "@/util/text/streamToText";
import { jsonDateParse } from "@/util/time/jsonDateParse";

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
