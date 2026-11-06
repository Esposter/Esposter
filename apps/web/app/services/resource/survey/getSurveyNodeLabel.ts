import type { SurveyNode } from "vue-survey-engine-headless";

import { surveyNodeTypeDefinitionMap } from "vue-survey-engine-headless";

// What a node is called in the layers tree and in a problem's row: its title, else its name, else the label of its kind
export const getSurveyNodeLabel = (node: SurveyNode) =>
  ("title" in node.props && node.props.title) ||
  ("name" in node.props && node.props.name) ||
  surveyNodeTypeDefinitionMap[node.type].label;
