import { AzureContainer } from "@/models/azure/blob";
import { TableEditor } from "@/models/tableEditor/TableEditor";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/clicker/constants";
import { jsonDateParse } from "@/utils/json";
import { streamToText } from "@/utils/text";
import { z } from "zod";

export const tableEditorRouter = router({
  readTableEditor: authedProcedure.query<TableEditor>(async ({ ctx }) => {
    try {
      const containerClient = await getContainerClient(AzureContainer.TableEditorAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new TableEditor();
      return jsonDateParse(await streamToText(response.readableStreamBody));
    } catch {
      return new TableEditor();
    }
  }),
  // @NOTE: Cannot have generic input based on inherited classes yet
  // https://github.com/trpc/trpc/discussions/2150
  saveTableEditor: authedProcedure.input(z.any()).mutation(async ({ input, ctx }) => {
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
