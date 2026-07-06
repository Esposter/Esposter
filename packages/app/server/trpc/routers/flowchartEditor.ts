import { FlowchartEditor, flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { router } from "@@/server/trpc";
import { createReadBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { AzureContainer } from "@esposter/db-schema";

export const flowchartEditorRouter = router({
  readFlowchartEditor: createReadBlobStateProcedure(AzureContainer.FlowchartEditorAssets, FlowchartEditor),
  saveFlowchartEditor: createSaveBlobStateProcedure(AzureContainer.FlowchartEditorAssets, flowchartEditorSchema),
});
