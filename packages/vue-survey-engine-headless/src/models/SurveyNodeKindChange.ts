import type { SurveyNode } from "#src/models/SurveyNode";

// A question converted to another kind: the node the new kind holds, and whether a prop the change drops holds content
export interface SurveyNodeKindChange {
  isContentDropped: boolean;
  node: SurveyNode;
}
