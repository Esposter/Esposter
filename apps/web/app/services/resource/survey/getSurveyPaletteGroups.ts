import type { PaletteGroup } from "@/models/ui/palette/PaletteGroup";
import type { SurveyDocument } from "vue-survey-engine-headless";

import { SURVEY_PALETTE_GROUPS } from "@/services/resource/survey/constants";
import { getSurveyInsertTarget } from "@/services/resource/survey/getSurveyInsertTarget";
import { SurveyNodeTypeIconMap } from "@/services/resource/survey/SurveyNodeTypeIconMap";
import { surveyNodeTypeDefinitionMap } from "vue-survey-engine-headless";

// The palette's groups of the survey kinds an insertion at the selection takes, each kind listed under its icon and the label its definition
// gives it. A group none of whose kinds is taken is dropped, so no heading stands over nothing
export const getSurveyPaletteGroups = (document: SurveyDocument, selectedPointer: string): PaletteGroup[] =>
  SURVEY_PALETTE_GROUPS.map(({ title, types }) => ({
    items: types
      .filter((type) => getSurveyInsertTarget(document, selectedPointer, type) !== undefined)
      .map((type) => ({
        icon: SurveyNodeTypeIconMap[type],
        kind: type,
        title: surveyNodeTypeDefinitionMap[type].label,
      })),
    title,
  })).filter(({ items }) => items.length > 0);
