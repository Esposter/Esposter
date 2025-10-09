import { AzureContainer } from "#shared/models/azure/container/AzureContainer";
import { FlowchartEditor, flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { useDownload } from "@@/server/composables/azure/useDownload";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { SAVE_FILENAME } from "@@/server/services/flowchartEditor/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { streamToText } from "@esposter/shared";

export const flowchartEditorRouter = router({
  readFlowchartEditor: authedProcedure.query<FlowchartEditor>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const { readableStreamBody } = await useDownload(AzureContainer.FlowchartEditorAssets, blobName);
      if (!readableStreamBody) return new FlowchartEditor();

      const json = await streamToText(readableStreamBody);
      return new FlowchartEditor(jsonDateParse(json));
    } catch {
      return new FlowchartEditor();
    }
  }),
  saveFlowchartEditor: authedProcedure.input(flowchartEditorSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.FlowchartEditorAssets, blobName, JSON.stringify(input));
  }),
});
