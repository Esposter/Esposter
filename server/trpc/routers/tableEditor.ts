import { AzureContainer } from "@/models/azure/blob";
import { Item, itemSchema } from "@/models/tableEditor/Item";
import { TableEditor, createTableEditorSchema } from "@/models/tableEditor/TableEditor";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/clicker/constants";
import { jsonDateParse } from "@/utils/json";
import { streamToText } from "@/utils/text";

export const tableEditorRouter = router({
  readTableEditor: authedProcedure.query<TableEditor<Item>>(async ({ ctx }) => {
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
  // @NOTE: We can't use createTableEditorSchema(itemSchema) here
  // because zod doesn't support validations with inherited subclasses
  // i.e. extra properties in the class will be seen as violating the validation
  saveTableEditor: authedProcedure.input(createTableEditorSchema(itemSchema)).mutation(async ({ input, ctx }) => {
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
