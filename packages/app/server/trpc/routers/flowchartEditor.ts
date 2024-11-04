import { AzureContainer } from "@/models/azure/blob";
import { FlowchartEditor, flowchartEditorSchema } from "@/models/flowchartEditor/FlowchartEditor";
import { uploadBlockBlob } from "@/server/services/azure/blob/uploadBlockBlob";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { SAVE_FILENAME } from "@/services/flowchartEditor/constants";
import { streamToText } from "@/util/text/streamToText";
import { jsonDateParse } from "@/util/time/jsonDateParse";

export const flowchartEditorRouter = router({
  readFlowchartEditor: authedProcedure.query<FlowchartEditor>(async ({ ctx }) => {
    try {
      const containerClient = await useContainerClient(AzureContainer.FlowchartEditorAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new FlowchartEditor();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new FlowchartEditor(), jsonDateParse(json));
    } catch {
      return new FlowchartEditor();
    }
  }),
  saveFlowchartEditor: authedProcedure.input(flowchartEditorSchema).mutation(async ({ ctx, input }) => {
    const client = await useContainerClient(AzureContainer.FlowchartEditorAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
