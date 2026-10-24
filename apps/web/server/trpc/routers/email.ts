import { getBaseUrl } from "#server/services/app/getBaseUrl";
import { compileEmailDocument } from "#server/services/emailEditor/compileEmailDocument";
import { transformPublishedEmail } from "#server/services/emailEditor/transformPublishedEmail";
import { router } from "#server/trpc";
import { createResourceProcedures } from "#server/trpc/procedure/resource/createResourceProcedures";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { emailDocumentSchema } from "#shared/services/pageBuilder/email/emailDocumentSchema";
import { ResourceType } from "@esposter/db-schema";

export const emailRouter = router({
  ...createResourceProcedures(ResourceType.Email, { transformPublishedContent: transformPublishedEmail }),
  // Preview's compile: the open document as the server compiles it, or the validator's message when its markup is refused
  compile: standardAuthedProcedure.input(emailDocumentSchema).query(({ input }) =>
    compileEmailDocument(input, { origin: getBaseUrl() }).match(
      (html) => ({ html }),
      (error) => ({ message: error.message }),
    ),
  ),
});
