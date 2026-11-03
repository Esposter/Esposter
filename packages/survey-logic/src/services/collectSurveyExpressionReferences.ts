import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";

import { walkSurveyExpressionReferences } from "#src/services/walkSurveyExpressionReferences";

// The distinct names the tree reads, in the order each is first read from the source
export const collectSurveyExpressionReferences = (node: SurveyExpressionNode): string[] => {
  const names = new Set<string>();
  walkSurveyExpressionReferences(node, names);
  return [...names];
};
