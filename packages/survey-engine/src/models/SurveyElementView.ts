import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";

// An element of the current page as the respondent sees it: the node, where it sits in the document, whether the respondent
// May change its answer and must give one, and the views of the elements inside it when it is a panel
export interface SurveyElementView {
  children: SurveyElementView[];
  isEnabled: boolean;
  isRequired: boolean;
  node: SurveyPlaceableNode;
  pointer: string;
}
