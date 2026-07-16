import { transformPublishedDashboard } from "@@/server/services/dashboard/transformPublishedDashboard";
import { router } from "@@/server/trpc";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { ResourceType } from "@esposter/db-schema";

export const dashboardRouter = router(
  createResourceProcedures(ResourceType.Dashboard, { transformPublishedContent: transformPublishedDashboard }),
);
