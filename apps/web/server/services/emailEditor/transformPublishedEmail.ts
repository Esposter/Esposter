import type { PublishableResourceProcedureOptions } from "#server/models/resource/PublishableResourceProcedureOptions";
import type { emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import type { z } from "zod";

import { compileEmailContent } from "#server/services/emailEditor/compileEmailContent";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { DatabaseEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// The published web view serves the compiled html, so the email is compiled here under strict validation: markup MJML
// refuses is not published, with the validator's own message. The dataset binding is owner-only state, stripped from
// the snapshot so the anonymous public read can never leak it
export const transformPublishedEmail: NonNullable<
  PublishableResourceProcedureOptions<z.output<typeof emailEditorSchema>>["transformPublishedContent"]
> = async (_ctx, _resource, content) =>
  (await compileEmailContent(content)).match(
    (html) => ({ ...content, datasetReference: undefined, html }),
    (error) => {
      throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Resource, error.message);
    },
  );
