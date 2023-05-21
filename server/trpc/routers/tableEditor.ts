import { AzureContainer } from "@/models/azure/blob";
import {
  TableEditorConfiguration,
  tableEditorConfigurationSchema,
} from "@/models/tableEditor/TableEditorConfiguration";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/clicker/constants";
import { jsonDateParse } from "@/utils/json";
import { streamToText } from "@/utils/text";

export const tableEditorRouter = router({
  readTableEditor: authedProcedure.query<TableEditorConfiguration>(async ({ ctx }) => {
    try {
      const containerClient = await getContainerClient(AzureContainer.TableEditorAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new TableEditorConfiguration();
      return jsonDateParse(await streamToText(response.readableStreamBody));
    } catch {
      return new TableEditorConfiguration();
    }
  }),
  saveTableEditor: authedProcedure.input(tableEditorConfigurationSchema).mutation(async ({ input, ctx }) => {
    try {
      const client = await getContainerClient(AzureContainer.TableEditorAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      await uploadBlockBlob(client, blobName, JSON.stringify(input));
      return true;
    } catch {
      return false;
    }
  }),
});
