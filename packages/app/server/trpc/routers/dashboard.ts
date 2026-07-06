import { dashboardSchema } from "#shared/models/dashboard/data/Dashboard";
import { transformPublishedDashboard } from "@@/server/services/dashboard/transformPublishedDashboard";
import { router } from "@@/server/trpc";
import { createDocumentProcedures } from "@@/server/trpc/procedure/document/createDocumentProcedures";
import { AzureContainer, DocumentType } from "@esposter/db-schema";

export const dashboardRouter = router(
  createDocumentProcedures(
    DocumentType.Dashboard,
    dashboardSchema,
    AzureContainer.DashboardAssets,
    transformPublishedDashboard,
  ),
);
