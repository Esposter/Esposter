import type { PaletteGroup } from "@/models/ui/palette/PaletteGroup";

import { SURVEY_PALETTE_GROUPS } from "@/services/resource/survey/constants";
import { SurveyNodeTypeIconMap } from "@/services/resource/survey/SurveyNodeTypeIconMap";
import { surveyNodeTypeDefinitionMap } from "headless-survey-engine";

// The palette's groups of survey kinds, each kind listed under its icon and the label its definition gives it
export const getSurveyPaletteGroups = (): PaletteGroup[] =>
  SURVEY_PALETTE_GROUPS.map(({ title, types }) => ({
    items: types.map((type) => ({
      icon: SurveyNodeTypeIconMap[type],
      kind: type,
      title: surveyNodeTypeDefinitionMap[type].label,
    })),
    title,
  }));
