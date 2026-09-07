import type { EmailEditor } from "#shared/models/emailEditor/data/EmailEditor";
import type { PublishableResourceProcedureOptions } from "@@/server/models/resource/PublishableResourceProcedureOptions";
import type { ToData } from "@esposter/shared";

import { transformPublishedBlobUrls } from "@@/server/services/resource/transformPublishedBlobUrls";
import { getInvalidOperationError } from "@@/server/trpc/guards/getInvalidOperationError";
import { DatabaseEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
// The published web view serves the compiled MJML directly, so an email that never captured one has
// Nothing to publish; the dataset binding is owner-only state and is stripped from the snapshot so the
// Anonymous public read can never leak it
export const transformPublishedEmail: NonNullable<
  PublishableResourceProcedureOptions<ToData<EmailEditor>>["transformPublishedContent"]
> = (ctx, resource, content) => {
  if (!content.html)
    throw getInvalidOperationError(
      Operation.Update,
      DatabaseEntityType.Resource,
      "cannot publish email without compiled html",
    );
  return transformPublishedBlobUrls(ctx, resource, { ...content, datasetReference: undefined });
};
