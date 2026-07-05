import {
  TableEditorConfiguration,
  tableEditorConfigurationSchema,
} from "#shared/models/tableEditor/data/TableEditorConfiguration";
import { router } from "@@/server/trpc";
import { createReadBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { AzureContainer } from "@esposter/db-schema";

export const tableEditorRouter = router({
  readTableEditorConfiguration: createReadBlobStateProcedure(
    AzureContainer.TableEditorAssets,
    TableEditorConfiguration,
  ),
  saveTableEditorConfiguration: createSaveBlobStateProcedure(
    AzureContainer.TableEditorAssets,
    tableEditorConfigurationSchema,
  ),
});
