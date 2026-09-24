import type { Resource } from "@esposter/db-schema";

import { SURVEY_INVITE_BUTTON_COLOR } from "@/services/grapesjs/constants";
import { createSurveyInviteBlocks } from "@/services/grapesjs/createSurveyInviteBlocks";

// The webpage canvas is plain HTML, so the invite is an anchor carrying the one style the page's own sheet
// Cannot supply — its colour
export const createWebpageSurveyInviteBlocks = (surveys: Resource[]) =>
  createSurveyInviteBlocks(
    surveys,
    ({ label, url }) => `<a href="${url}" style="background-color: ${SURVEY_INVITE_BUTTON_COLOR}">${label}</a>`,
  );
