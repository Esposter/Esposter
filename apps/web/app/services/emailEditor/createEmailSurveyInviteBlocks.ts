import type { Resource } from "@esposter/db-schema";

import { SURVEY_INVITE_BUTTON_COLOR } from "@/services/grapesjs/constants";
import { createSurveyInviteBlocks } from "@/services/grapesjs/createSurveyInviteBlocks";

// The email canvas is MJML, so the invite button is an mj-button
export const createEmailSurveyInviteBlocks = (surveys: Resource[]) =>
  createSurveyInviteBlocks(
    surveys,
    ({ label, url }) =>
      `<mj-button background-color="${SURVEY_INVITE_BUTTON_COLOR}" href="${url}">${label}</mj-button>`,
  );
