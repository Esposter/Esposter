import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { useContainerClient } from "@@/server/util/azure/useContainerClient";
import { z } from "zod";
import { zfd } from "zod-form-data";

export const userRouter = router({
  uploadProfileImage: authedProcedure
    .input(zfd.formData({ file: z.instanceof(Blob) }))
    .mutation(async ({ ctx, input }) => {
      const containerClient = await useContainerClient(AzureContainer.UserAssets);
      const blobName = `${ctx.session.user.id}/profile`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadData(input.file);
      return blockBlobClient.url;
    }),
});
