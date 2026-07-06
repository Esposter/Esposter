import { emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { router } from "@@/server/trpc";
import { createDocumentProcedures } from "@@/server/trpc/procedure/document/createDocumentProcedures";
import { AzureContainer, DocumentType } from "@esposter/db-schema";

export const emailEditorRouter = router(
  createDocumentProcedures(DocumentType.Email, emailEditorSchema, AzureContainer.EmailEditorAssets),
);
