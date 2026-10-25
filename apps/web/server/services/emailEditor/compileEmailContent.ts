import type { z } from "zod";

import { getBaseUrl } from "#server/services/app/getBaseUrl";
import { compileEmailDocument } from "#server/services/emailEditor/compileEmailDocument";
import { emailEditorSchema } from "#shared/models/emailEditor/data/EmailEditor";

// The working copy's body and head compiled to email html. Publish bakes it into the snapshot and the personalised
// Export compiles the stored copy through it, so both refuse the same markup with the same message
export const compileEmailContent = (content: z.output<typeof emailEditorSchema>) =>
  // Cast avoids the excessively deep MjmlNode instantiation the working copy's content type reaches
  compileEmailDocument({ content: content.content, root: content.root } as Parameters<typeof compileEmailDocument>[0], {
    origin: getBaseUrl(),
  });
