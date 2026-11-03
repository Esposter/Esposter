import type { SurveyPlaceableNode } from "#src/models/SurveyPlaceableNode";

import { SurveyNodeType } from "#src/models/SurveyNodeType";

// The nodes of a list that pass a guard, read through the panels that hold them, in document order
export const collectSurveyLeafNodes = <T extends SurveyPlaceableNode>(
  nodes: SurveyPlaceableNode[],
  checkIsLeaf: (node: SurveyPlaceableNode) => node is T,
): T[] =>
  nodes.flatMap((node) => {
    if (node.type === SurveyNodeType.Panel) return collectSurveyLeafNodes(node.props.children, checkIsLeaf);

    return checkIsLeaf(node) ? [node] : [];
  });
