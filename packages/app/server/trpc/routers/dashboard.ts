import { getResultAsync } from "@esposter/shared";
import { Dashboard, dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { SAVE_FILENAME } from "@@/server/services/dashboard/constants";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { jsonDateParse, streamToText } from "@esposter/shared";

export const dashboardRouter = router({
  readDashboard: standardAuthedProcedure.query<Dashboard>(({ ctx }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    return getResultAsync(async () => {
      const { readableStreamBody } = await useDownload(AzureContainer.DashboardAssets, blobName);
      if (!readableStreamBody) return new Dashboard();
      const json = await streamToText(readableStreamBody);
      return new Dashboard(jsonDateParse(json));
    })
      .orTee(console.error)
      .unwrapOr(new Dashboard());
  }),
  saveDashboard: standardAuthedProcedure.input(dashboardSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.DashboardAssets, blobName, JSON.stringify(input));
  }),
});
