import type { PublishableResourceProcedureOptions } from "#server/models/resource/PublishableResourceProcedureOptions";
import type { emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import type { z } from "zod";

import { getBaseUrl } from "#server/services/app/getBaseUrl";
import { compileEmailDocument } from "#server/services/emailEditor/compileEmailDocument";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { DatabaseEntityType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

// The published web view serves the compiled html, so the email is compiled here under strict validation: markup MJML
// Refuses is not published, with the validator's own message. The dataset binding is owner-only state, stripped from
// The snapshot so the anonymous public read can never leak it
export const transformPublishedEmail: NonNullable<
  PublishableResourceProcedureOptions<z.output<typeof emailEditorSchema>>["transformPublishedContent"]
> = async (_ctx, _resource, content) => {
  // Cast avoids the excessively deep MjmlNode instantiation the working copy's content type reaches
  const document = { content: content.content, root: content.root } as Parameters<typeof compileEmailDocument>[0];
  const result = await compileEmailDocument(document, { origin: getBaseUrl() });

  return result.match(
    (html) => ({ ...content, datasetReference: undefined, html }),
    (error) => {
      throw getInvalidOperationError(Operation.Update, DatabaseEntityType.Resource, error.message);
    },
  );
};
