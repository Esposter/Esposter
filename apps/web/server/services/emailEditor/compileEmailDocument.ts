import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { MjmlDocument } from "mjml-blocks";

import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { getResultAsync } from "@esposter/shared";
import mjml2html from "mjml";
import { renderMjmlDocument } from "mjml-blocks";

// An email document in MJML's JSON form, compiled to HTML under strict validation, so markup MJML would reject is
// Refused with the validator's own message rather than sent
export const compileEmailDocument = (document: MjmlDocument, context: RenderContext) => {
  const json = renderMjmlDocument(document, emailRegistry, { context, isStampingIds: false });
  return getResultAsync(() => mjml2html(json, { validationLevel: "strict" })).map(({ html }) => html);
};
