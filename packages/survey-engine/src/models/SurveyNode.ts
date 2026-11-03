import type { SurveyPageNode } from "#src/models/SurveyPageNode";
import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";

// Any node a survey holds, of whichever of its types, narrowed by its type tag
export type SurveyNode = SurveyPageNode | SurveyPlaceableNode;
