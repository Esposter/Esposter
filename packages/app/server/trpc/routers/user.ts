import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { PROFILE_FILENAME } from "#shared/services/user/constants";
import { uploadBlockBlob } from "@@/server/services/azure/blob/uploadBlockBlob";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { useContainerClient } from "@@/server/util/azure/useContainerClient";
import { z } from "zod";

export const userRouter = router({
  uploadProfileImage: authedProcedure.input(z.instanceof(ArrayBuffer)).mutation(async ({ ctx, input }) => {
    const containerClient = await useContainerClient(AzureContainer.UserAssets);
    const blobName = `${ctx.session.user.id}/${PROFILE_FILENAME}`;
    await uploadBlockBlob(containerClient, blobName, Buffer.from(input));
  }),
});
