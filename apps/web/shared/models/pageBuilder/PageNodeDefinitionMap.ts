import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { PageNode } from "#shared/models/pageBuilder/PageNode";

// An editor's registry: each node type of its union keyed to its definition
export type PageNodeDefinitionMap<TNode extends PageNode> = {
  [TType in TNode["type"]]: NodeTypeDefinition<TNode, TType, Extract<TNode, { type: TType }>["props"]>;
};
