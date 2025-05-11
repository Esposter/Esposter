import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { Dashboard, dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { streamToText } from "#shared/util/text/streamToText";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { useDownload } from "@@/server/composables/azure/useDownload";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { SAVE_FILENAME } from "@@/server/services/dashboard/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";

export const dashboardRouter = router({
  readDashboard: authedProcedure.query<Dashboard>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const response = await useDownload(AzureContainer.DashboardAssets, blobName);
      if (!response.readableStreamBody) return new Dashboard();

      const json = await streamToText(response.readableStreamBody);
      return Object.assign(new Dashboard(), jsonDateParse(json));
    } catch {
      return new Dashboard();
    }
  }),
  saveDashboard: authedProcedure.input(dashboardSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.DashboardAssets, blobName, JSON.stringify(input));
  }),
});
