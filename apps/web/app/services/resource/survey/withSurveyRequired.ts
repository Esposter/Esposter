import type { SurveyQuestionNode } from "survey-engine";

// A question's node with the required flag the runner decides for it, which is the flag a field's mark and its hint read from the node
export const withSurveyRequired = <T extends SurveyQuestionNode>(node: T, isRequired: boolean): T => ({
  ...node,
  props: { ...node.props, isRequired },
});
