import { transformPublishedBlobUrls } from "@@/server/services/resource/transformPublishedBlobUrls";
import { transformReadBlobUrls } from "@@/server/services/resource/transformReadBlobUrls";
import { router } from "@@/server/trpc";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { ResourceType } from "@esposter/db-schema";

export const webpageRouter = router(
  createResourceProcedures(ResourceType.Webpage, {
    transformPublicReadContent: transformReadBlobUrls,
    transformPublishedContent: transformPublishedBlobUrls,
    transformReadContent: transformReadBlobUrls,
  }),
);
