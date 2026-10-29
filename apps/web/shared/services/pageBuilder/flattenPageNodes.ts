import type { PageNode } from "#shared/models/pageBuilder/PageNode";
import type { PageNodeDefinitionMap } from "#shared/models/pageBuilder/PageNodeDefinitionMap";

import { getChildNodes } from "#shared/services/pageBuilder/getChildNodes";

// Every node under the given ones, each before its children, in document order
export const flattenPageNodes = <TNode extends PageNode>(
  definitionMap: PageNodeDefinitionMap<TNode>,
  nodes: TNode[],
): TNode[] => nodes.flatMap((node) => [node, ...flattenPageNodes(definitionMap, getChildNodes(definitionMap, node))]);
