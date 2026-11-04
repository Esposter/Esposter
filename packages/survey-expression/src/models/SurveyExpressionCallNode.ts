import type { SurveyExpressionNode } from "#src/models/SurveyExpressionNode";
import type { SurveyExpressionNodeType } from "#src/models/SurveyExpressionNodeType";

// A call by name with any number of arguments. The name is any identifier, so whether a function of that name exists is
// A check made after the parse, never a parse error
export interface SurveyExpressionCallNode {
  args: SurveyExpressionNode[];
  name: string;
  position: number;
  type: SurveyExpressionNodeType.Call;
}
