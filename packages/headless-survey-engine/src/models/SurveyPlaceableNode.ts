import type { SurveyPanelNode } from "#src/models/SurveyPanelNode";
import type { SurveyQuestionNode } from "#src/models/SurveyQuestionNode";

// Every node a page or a panel may hold: any question, or a panel
export type SurveyPlaceableNode = SurveyPanelNode | SurveyQuestionNode;
