import { AzureContainer } from "@/models/azure/blob";
import { Dashboard, dashboardSchema } from "@/models/dashboard/Dashboard";
import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure/authedProcedure";
import { getContainerClient, uploadBlockBlob } from "@/services/azure/blob";
import { SAVE_FILENAME } from "@/services/dashboard/constants";
import { streamToText } from "@/util/text/streamToText";
import { jsonDateParse } from "@/util/time/jsonDateParse";

export const dashboardRouter = router({
  readDashboard: authedProcedure.query<Dashboard>(async ({ ctx }) => {
    try {
      const containerClient = await getContainerClient(AzureContainer.DashboardAssets);
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
    const client = await getContainerClient(AzureContainer.DashboardAssets);
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await uploadBlockBlob(client, blobName, JSON.stringify(input));
  }),
});
