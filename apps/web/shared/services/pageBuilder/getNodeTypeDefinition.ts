import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { PageNode } from "#shared/models/pageBuilder/PageNode";
import type { PageNodeDefinitionMap } from "#shared/models/pageBuilder/PageNodeDefinitionMap";

// A node's definition is the one its own type keys, which the map's mapped type cannot correlate with a node of the
// Union, so the one cast lives here rather than at every reader
export const getNodeTypeDefinition = <TNode extends PageNode>(
  definitionMap: PageNodeDefinitionMap<TNode>,
  node: TNode,
) => definitionMap[node.type as TNode["type"]] as unknown as NodeTypeDefinition<TNode, TNode["type"], TNode["props"]>;
