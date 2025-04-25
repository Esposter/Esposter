import type { ReadableStream } from "node:stream/web";

import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { useContainerClient } from "@@/server/composables/azure/useContainerClient";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { octetInputParser } from "@trpc/server/http";
import { Readable } from "node:stream";

export const userRouter = router({
  uploadProfileImage: authedProcedure.input(octetInputParser).mutation(async ({ ctx, input }) => {
    const containerClient = await useContainerClient(AzureContainer.PublicUserAssets);
    const blobName = `${ctx.session.user.id}/ProfileImage`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    // @TODO: We shouldn't need to cast to ReadableStream here if the types are unified
    const readable = Readable.fromWeb(input as ReadableStream);
    await blockBlobClient.uploadStream(readable);
    return blockBlobClient.url;
  }),
});
