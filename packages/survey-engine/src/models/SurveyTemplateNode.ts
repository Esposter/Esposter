import type { SurveyPanelDynamicNode } from "#src/models/SurveyPanelDynamicNode";
import type { SurveyQuestionNode } from "#src/models/SurveyQuestionNode";

// Every node a dynamic panel's template may hold: any question but a dynamic panel, which bounds the nesting at one level
export type SurveyTemplateNode = Exclude<SurveyQuestionNode, SurveyPanelDynamicNode>;
