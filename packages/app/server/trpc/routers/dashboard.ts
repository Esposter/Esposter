import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { Dashboard, dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { streamToText } from "#shared/util/text/streamToText";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { uploadBlockBlob } from "@@/server/services/azure/blob/uploadBlockBlob";
import { SAVE_FILENAME } from "@@/server/services/dashboard/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { useContainerClient } from "@@/server/util/azure/useContainerClient";

export const dashboardRouter = router({
  readDashboard: authedProcedure.query<Dashboard>(async ({ ctx }) => {
    try {
      const containerClient = await useContainerClient(AzureContainer.DashboardAssets);
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const response = await blockBlobClient.download();
      if (!response.readableStreamBody) return new Dashboard();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new Dashboard(), jsonDateParse(json));
    } catch {
      return new Dashboard();
    }
  }),
  saveDashboard: authedProcedure.input(dashboardSchema).mutation(async ({ ctx, input }) => {
    const client = await useContainerClient(AzureContainer.DashboardAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
