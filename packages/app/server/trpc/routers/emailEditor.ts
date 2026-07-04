import { EmailEditor, emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { router } from "@@/server/trpc";
import { createReadBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { AzureContainer } from "@esposter/db-schema";

export const emailEditorRouter = router({
  readEmailEditor: createReadBlobStateProcedure(AzureContainer.EmailEditorAssets, EmailEditor),
  saveEmailEditor: createSaveBlobStateProcedure(AzureContainer.EmailEditorAssets, emailEditorSchema),
});
