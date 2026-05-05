import { FlowchartEditor, flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { SAVE_FILENAME } from "@@/server/services/flowchartEditor/constants";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { jsonDateParse, streamToText, toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

export const flowchartEditorRouter = router({
  readFlowchartEditor: standardAuthedProcedure.query<FlowchartEditor>(({ ctx }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    return ResultAsync.fromPromise(
      useDownload(AzureContainer.FlowchartEditorAssets, blobName).then(async ({ readableStreamBody }) => {
        if (!readableStreamBody) return new FlowchartEditor();
        const json = await streamToText(readableStreamBody);
        return new FlowchartEditor(jsonDateParse(json));
      }),
      toAppError,
    )
      .orTee(console.error)
      .unwrapOr(new FlowchartEditor());
  }),
  saveFlowchartEditor: standardAuthedProcedure.input(flowchartEditorSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.FlowchartEditorAssets, blobName, JSON.stringify(input));
  }),
});
