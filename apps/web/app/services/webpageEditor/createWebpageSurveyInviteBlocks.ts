import type { GrapesJsBlock } from "@/models/grapesjs/GrapesJsBlock";
import type { Resource } from "@esposter/db-schema";

import { SURVEY_INVITE_BUTTON_COLOR } from "@/services/grapesjs/constants";
import { createSurveyInviteBlocks } from "@/services/grapesjs/createSurveyInviteBlocks";

// The webpage canvas is plain HTML and the published page loads no stylesheet of ours,
// So the invite button carries its own inline styling
export const createWebpageSurveyInviteBlocks = (surveys: Resource[]): GrapesJsBlock[] =>
  createSurveyInviteBlocks(
    surveys,
    ({ label, url }) =>
      `<a href="${url}" style="display: inline-block; padding: 10px 25px; background-color: ${SURVEY_INVITE_BUTTON_COLOR}; color: #ffffff; font-family: Helvetica, sans-serif; font-size: 13px; text-decoration: none; border-radius: 3px;">${label}</a>`,
  );
