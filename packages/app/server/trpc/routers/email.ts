import { transformPublishedEmail } from "@@/server/services/emailEditor/transformPublishedEmail";
import { router } from "@@/server/trpc";
import { createResourceProcedures } from "@@/server/trpc/procedure/resource/createResourceProcedures";
import { ResourceType } from "@esposter/db-schema";

export const emailRouter = router(
  createResourceProcedures(ResourceType.Email, { transformPublishedContent: transformPublishedEmail }),
);
