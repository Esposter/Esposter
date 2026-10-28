import type { DatasetReference } from "#shared/models/dataset/DatasetReference";

import { getBaseUrl } from "#server/services/app/getBaseUrl";
import { compileEmailContent } from "#server/services/emailEditor/compileEmailContent";
import { compileEmailDocument } from "#server/services/emailEditor/compileEmailDocument";
import { transformPublishedEmail } from "#server/services/emailEditor/transformPublishedEmail";
import { readResourceContent } from "#server/services/resource/readResourceContent";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { getOwnerProcedure } from "#server/trpc/procedure/resource/getOwnerProcedure";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { resourceIdInputSchema } from "#shared/models/db/resource/ResourceIdInput";
import { emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";
import { emailDocumentSchema } from "#shared/services/pageBuilder/email/emailDocumentSchema";
import { DatabaseEntityType, ResourceType } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";

export const emailRouter = router({
  ...createResourceProcedures(ResourceType.Email, { transformPublishedContent: transformPublishedEmail }),
  // Preview's compile: the open document as the server compiles it, or the validator's message when its markup is refused.
  // A mutation, so the document rides the request body: as a query it rode the URL, which a long email outgrows
  compile: standardAuthedProcedure
    .input(emailDocumentSchema)
    .meta({ humanOnly: "The editor's own preview of the document open in it, compiled as its owner edits" })
    .mutation<{ html: string } | { message: string }>(({ input }) =>
      compileEmailDocument(input, { origin: getBaseUrl() }).match(
        (html) => ({ html }),
        (error) => ({ message: error.message }),
      ),
    ),
  // The personalised export's compile, over the stored working copy so it runs with the editor closed and includes the
  // Latest saved edit. The bound dataset comes back beside the html, since the export reads its rows from it
  generateEmailHtml: getOwnerProcedure(ResourceType.Email, resourceIdInputSchema, "id")
    .meta({ humanOnly: "The personalised export a person sends, which nothing recalls once it is sent" })
    .query<{ datasetReference?: DatasetReference; html: string }>(async ({ input: { id } }) => {
      const resourceContent = readResourceContent(emailEditorSchema, id);
      const content = await requireEntity(resourceContent, DatabaseEntityType.Resource, id);

      return (await compileEmailContent(content)).match(
        (html) => ({ datasetReference: content.datasetReference, html }),
        (error) => {
          throw getInvalidOperationError(Operation.Read, DatabaseEntityType.Resource, error.message);
        },
      );
    }),
});
