import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";

// An element of the current page as the respondent sees it: the node, where it sits in the document, and the views of the elements inside it when it is a panel
// Whether the respondent may change its answer and must give one is what its two flags hold
export interface SurveyElementView {
  children: SurveyElementView[];
  isEnabled: boolean;
  isRequired: boolean;
  node: SurveyPlaceableNode;
  pointer: string;
}
