import type { SurveyHtmlNode } from "#src/models/SurveyHtmlNode";
import type { SurveyImageNode } from "#src/models/SurveyImageNode";
import type { SurveyNode } from "#src/models/SurveyNode";
import type { SurveyPageNode } from "#src/models/SurveyPageNode";
import type { SurveyPanelNode } from "#src/models/SurveyPanelNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";

// The nodes that hold no value of a response: a page and a panel are containers, and a block of markup or a picture holds no answer
// A calculated value is not among them, since a completed response carries its value even though no respondent gives it
const NON_ANSWERING_NODE_TYPES = new Set<SurveyNodeType>([
  SurveyNodeType.Page,
  SurveyNodeType.Panel,
  SurveyNodeType.Html,
  SurveyNodeType.Image,
]);

// A node a response holds a value for: a question, a calculated value included
// The leaf check of a response, the enabled check of a node and the app's response columns and summary cards all read this one guard
export const checkIsSurveyAnsweringNode = (
  node: SurveyNode,
): node is Exclude<SurveyNode, SurveyHtmlNode | SurveyImageNode | SurveyPageNode | SurveyPanelNode> =>
  !NON_ANSWERING_NODE_TYPES.has(node.type);
