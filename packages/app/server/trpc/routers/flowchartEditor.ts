import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { FlowchartEditor, flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { streamToText } from "#shared/util/text/streamToText";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { SAVE_FILENAME } from "@@/server/services/flowchartEditor/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { useDownload } from "@@/server/util/azure/useDownload";
import { useUpload } from "@@/server/util/azure/useUpload";

export const flowchartEditorRouter = router({
  readFlowchartEditor: authedProcedure.query<FlowchartEditor>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const response = await useDownload(AzureContainer.FlowchartEditorAssets, blobName);
      if (!response.readableStreamBody) return new FlowchartEditor();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new FlowchartEditor(), jsonDateParse(json));
    } catch {
      return new FlowchartEditor();
    }
  }),
  saveFlowchartEditor: authedProcedure.input(flowchartEditorSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.FlowchartEditorAssets, blobName, JSON.stringify(input));
  }),
});
