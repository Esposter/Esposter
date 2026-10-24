import { transformPublishedWebpage } from "#server/services/webpage/transformPublishedWebpage";
import { router } from "#server/trpc";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { ResourceType } from "@esposter/db-schema";

export const webpageRouter = router(
  createResourceProcedures(ResourceType.Webpage, { transformPublishedContent: transformPublishedWebpage }),
);
