import type { SurveyHtmlNode } from "#src/models/SurveyHtmlNode";
import type { SurveyImageNode } from "#src/models/SurveyImageNode";
import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyPageNode } from "#src/models/SurveyPageNode";
import type { SurveyPanelNode } from "#src/models/SurveyPanelNode";

import { checkIsSurveyAnsweringType } from "#src/services/runner/checkIsSurveyAnsweringType";

// A node a response holds a value for: a question, a calculated value included
// The leaf check of a response, the enabled check of a node and the app's response columns and summary cards all read this one guard
export const checkIsSurveyAnsweringNode = (
  node: SurveyNode,
): node is Exclude<SurveyNode, SurveyHtmlNode | SurveyImageNode | SurveyPageNode | SurveyPanelNode> =>
  checkIsSurveyAnsweringType(node.type);
