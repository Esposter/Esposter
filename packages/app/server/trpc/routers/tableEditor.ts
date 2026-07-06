import { tableEditorConfigurationSchema } from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { router } from "@@/server/trpc";
import { createDocumentProcedures } from "@@/server/trpc/procedure/document/createDocumentProcedures";
import { AzureContainer, DocumentType } from "@esposter/db-schema";

export const tableEditorRouter = router(
  createDocumentProcedures(DocumentType.Table, tableEditorConfigurationSchema, AzureContainer.TableEditorAssets),
);
