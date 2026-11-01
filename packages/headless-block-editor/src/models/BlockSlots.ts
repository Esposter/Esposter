import type { BlockNode } from "#src/models/BlockNode";
import type { SlotKeys } from "#src/models/SlotKeys";

// A node's own slots, each the list of child nodes that slot holds, keyed by the slots its type's props declare
export type BlockSlots<TNode extends BlockNode, TChild extends BlockNode = TNode> = TNode extends BlockNode
  ? // oxlint-disable-next-line typescript/consistent-indexed-object-style -- the mapped form is cheaper in the type bench than a Record, as BlockChildren.typebench.md records
    { [TSlot in SlotKeys<TNode["props"]>]: readonly TChild[] }
  : never;
