import type { WebpageDocument } from "#shared/models/pageBuilder/WebpageDocument";

import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { getPresentDefinitions } from "#shared/services/pageBuilder/getPresentDefinitions";

// Whether a webpage holds a survey invite, the one node whose survey the critique looks up
export const checkHasSurveyInvite = (document: WebpageDocument): boolean =>
  getPresentDefinitions(document).some(({ type }) => type === WebpageNodeType.SurveyInvite);
