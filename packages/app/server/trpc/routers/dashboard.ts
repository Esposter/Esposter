import { Dashboard, dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { useDownload } from "@@/server/composables/azure/container/useDownload";
import { useUpload } from "@@/server/composables/azure/container/useUpload";
import { SAVE_FILENAME } from "@@/server/services/dashboard/constants";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { AzureContainer } from "@esposter/db-schema";
import { jsonDateParse, streamToText, toAppError } from "@esposter/shared";
import { ResultAsync } from "neverthrow";

export const dashboardRouter = router({
  readDashboard: standardAuthedProcedure.query<Dashboard>(({ ctx }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    return ResultAsync.fromPromise(
      useDownload(AzureContainer.DashboardAssets, blobName).then(async ({ readableStreamBody }) => {
        if (!readableStreamBody) return new Dashboard();
        const json = await streamToText(readableStreamBody);
        return new Dashboard(jsonDateParse(json));
      }),
      toAppError,
    )
      .tapErr(console.error)
      .unwrapOr(new Dashboard());
  }),
  saveDashboard: standardAuthedProcedure.input(dashboardSchema).mutation(async ({ ctx, input }) => {
    const blobName = `${ctx.getSessionPayload.user.id}/${SAVE_FILENAME}`;
    await useUpload(AzureContainer.DashboardAssets, blobName, JSON.stringify(input));
  }),
});
