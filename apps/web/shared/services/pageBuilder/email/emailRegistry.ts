import type { RenderContext } from "#shared/models/pageBuilder/RenderContext";
import type { MjmlRegistry } from "mjml-blocks";

import { emailSurveyInviteType } from "#shared/services/pageBuilder/email/emailSurveyInviteType";
import { noteRichText } from "#shared/services/pageBuilder/email/noteRichText";
import { createMjmlRegistry } from "mjml-blocks";

// The email's registry: MJML's component set, with the survey invite beside it and the Note's writing kit as rich text
export const emailRegistry: MjmlRegistry<RenderContext> = createMjmlRegistry({
  leafTypes: [emailSurveyInviteType],
  richText: noteRichText,
});
