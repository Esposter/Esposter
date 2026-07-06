import { flowchartEditorSchema } from "#shared/models/flowchartEditor/data/FlowchartEditor";
import { router } from "@@/server/trpc";
import { createDocumentProcedures } from "@@/server/trpc/procedure/document/createDocumentProcedures";
import { AzureContainer, DocumentType } from "@esposter/db-schema";

export const flowchartEditorRouter = router(
  createDocumentProcedures(DocumentType.Flowchart, flowchartEditorSchema, AzureContainer.FlowchartEditorAssets),
);
