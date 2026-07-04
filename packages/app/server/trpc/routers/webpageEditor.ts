import { WebpageEditor, webpageEditorSchema } from "#shared/models/webpageEditor/data/WebpageEditor";
import { router } from "@@/server/trpc";
import { createReadBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { AzureContainer } from "@esposter/db-schema";

export const webpageEditorRouter = router({
  readWebpageEditor: createReadBlobStateProcedure(AzureContainer.WebpageEditorAssets, WebpageEditor),
  saveWebpageEditor: createSaveBlobStateProcedure(AzureContainer.WebpageEditorAssets, webpageEditorSchema),
});
