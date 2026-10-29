import type { PageNode } from "#shared/models/pageBuilder/PageNode";
import type { PageNodeDefinitionMap } from "#shared/models/pageBuilder/PageNodeDefinitionMap";

import { getNodeTypeDefinition } from "#shared/services/pageBuilder/getNodeTypeDefinition";

export const getChildNodes = <TNode extends PageNode>(
  definitionMap: PageNodeDefinitionMap<TNode>,
  node: TNode,
): TNode[] =>
  Object.keys(getNodeTypeDefinition(definitionMap, node).slots).flatMap(
    (slotKey) => Reflect.get(node.props, slotKey) as TNode[],
  );
