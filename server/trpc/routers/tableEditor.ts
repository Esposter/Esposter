import { AzureContainer } from "@/models/azure/blob";
import {
  TableEditorConfiguration,
  tableEditorConfigurationSchema,
} from "@/models/tableEditor/TableEditorConfiguration";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/clicker/constants";
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
      // We need to catch the case where the user is reading for the very first time
      // and there is no table editor configuration saved yet
      return new TableEditorConfiguration();
    }
  }),
  saveTableEditor: authedProcedure.input(tableEditorConfigurationSchema).mutation(async ({ input, ctx }) => {
    const client = await getContainerClient(AzureContainer.TableEditorAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
