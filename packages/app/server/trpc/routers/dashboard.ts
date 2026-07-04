import { Dashboard, dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { router } from "@@/server/trpc";
import { createReadBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createReadBlobStateProcedure";
import { createSaveBlobStateProcedure } from "@@/server/trpc/procedure/blobState/createSaveBlobStateProcedure";
import { AzureContainer } from "@esposter/db-schema";

export const dashboardRouter = router({
  readDashboard: createReadBlobStateProcedure(AzureContainer.DashboardAssets, Dashboard),
  saveDashboard: createSaveBlobStateProcedure(AzureContainer.DashboardAssets, dashboardSchema),
});
