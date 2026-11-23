import type { BlockNode } from "#src/models/BlockNode";
import type { BlockSlotName } from "#src/models/BlockSlotName";

import { getBlockPropPointer } from "#src/services/getBlockPropPointer";

// The pointer of a slot of the node at a node pointer, named by a slot the node's type declares, so a misspelt slot
// Fails the typecheck
// The typed slot name is the helper's whole job, and the core's walks build the same pointer
// oxlint-disable-next-line pass-through-helper/no-forwarding-wrapper -- from runtime names through getBlockPropPointer
export const getSlotPointer = <TNode extends BlockNode>(nodePointer: string, slot: BlockSlotName<TNode>): string =>
  getBlockPropPointer(nodePointer, slot);
