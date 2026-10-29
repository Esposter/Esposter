import type { NodeTypeDefinition } from "#shared/models/pageBuilder/NodeTypeDefinition";
import type { PageNode } from "#shared/models/pageBuilder/PageNode";
import type { PageNodeProps } from "#shared/models/pageBuilder/PageNodeProps";
import type { Except } from "type-fest";

import { createNodeId } from "#shared/services/pageBuilder/createNodeId";

// A fresh node of the type, its props the definition's own with any the caller already knows laid over them
export const createPageNode = <TNode extends PageNode, TType extends TNode["type"], TProps extends PageNodeProps>(
  definition: NodeTypeDefinition<TNode, TType, TProps>,
  props: Partial<Except<TProps, "id">> = {},
): PageNode<TType, TProps> => ({
  // The definition's props lack only the id, which is minted here
  props: { ...definition.createProps(), ...props, id: createNodeId() } as TProps,
  type: definition.type,
});
