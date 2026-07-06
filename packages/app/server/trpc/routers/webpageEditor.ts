import { webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { router } from "@@/server/trpc";
import { createDocumentProcedures } from "@@/server/trpc/procedure/document/createDocumentProcedures";
import { AzureContainer, DocumentType } from "@esposter/db-schema";

export const webpageEditorRouter = router(
  createDocumentProcedures(DocumentType.Webpage, webpageEditorSchema, AzureContainer.WebpageEditorAssets),
);
