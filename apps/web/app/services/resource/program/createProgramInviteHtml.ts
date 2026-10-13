import type { ProgramInvite } from "#shared/models/resource/program/ProgramInvite";

import { substituteMergeFields } from "@/services/emailEditor/substituteMergeFields";

// Personalizes the bound email for one participant: their audience row fills the merge fields, and their token rides
// On every link to the survey, so the invite button the email already has becomes their own link. A link is matched
// Only where it ends at its closing quote, so a survey path inside longer text is left alone
export const createProgramInviteHtml = (emailHtml: string, surveyPath: string, { row, token }: ProgramInvite) => {
  const query = new URLSearchParams({ t: token }).toString();
  const tokenedHtml = emailHtml
    .replaceAll(`${surveyPath}"`, `${surveyPath}?${query}"`)
    .replaceAll(`${surveyPath}'`, `${surveyPath}?${query}'`);
  return substituteMergeFields(tokenedHtml, row);
};
