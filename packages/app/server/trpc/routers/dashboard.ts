import { Dashboard, dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { useDownload } from "@@/server/composables/azure/useDownload";
import { useUpload } from "@@/server/composables/azure/useUpload";
import { SAVE_FILENAME } from "@@/server/services/dashboard/constants";
import { router } from "@@/server/trpc";
import { authedProcedure } from "@@/server/trpc/procedure/authedProcedure";
import { AzureContainer } from "@esposter/db";
import { jsonDateParse, streamToText } from "@esposter/shared";

export const dashboardRouter = router({
  readDashboard: authedProcedure.query<Dashboard>(async ({ ctx }) => {
    try {
      const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
      const { readableStreamBody } = await useDownload(AzureContainer.DashboardAssets, blobName);
      if (!readableStreamBody) return new Dashboard();

      const json = await streamToText(readableStreamBody);
      return new Dashboard(jsonDateParse(json));
    } catch {
      return new Dashboard();
    }
  }),
  saveDashboard: authedProcedure.input(dashboardSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.session.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.DashboardAssets, blobName, JSON.stringify(input));
  }),
});
