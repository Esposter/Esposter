import type { CompiledEmail } from "#shared/models/pageBuilder/email/CompiledEmail";
import type { EmailDocument } from "#shared/models/pageBuilder/email/EmailDocument";
import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";

import { renderEmailMjml } from "#shared/services/pageBuilder/email/renderEmailMjml";
import mjml2html from "mjml";

// Soft validation renders whatever MJML can and returns its messages beside the HTML, so a preview shows both and a
// Publish refuses an email with any
export const compileEmailHtml = async (document: EmailDocument, context: RenderContext): Promise<CompiledEmail> => {
  const { errors, html } = await mjml2html(renderEmailMjml(document, context), { validationLevel: "soft" });
  return { errors: errors.map(({ formattedMessage }) => formattedMessage), html };
};
