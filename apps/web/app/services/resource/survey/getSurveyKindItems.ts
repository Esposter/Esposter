import type { Item } from "#src/models/shared/Item";
import type { SurveyNodeType } from "vue-survey-engine-headless";

import { SurveyNodeTypeIconMap } from "#src/services/resource/survey/SurveyNodeTypeIconMap";
import { surveyNodeTypeDefinitionMap } from "vue-survey-engine-headless";

// The menu items for a list of kinds, each titled by its label and taking the kind when it is clicked
export const getSurveyKindItems = (types: SurveyNodeType[], onClick: (type: SurveyNodeType) => void): Item[] =>
  types.map((type) => ({
    meaning: SurveyNodeTypeIconMap[type],
    onClick: () => {
      onClick(type);
    },
    title: surveyNodeTypeDefinitionMap[type].label,
  }));
