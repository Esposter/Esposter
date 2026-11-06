import type { BlockNode } from "#src/models/BlockNode";
import type { SlotKeys } from "#src/models/SlotKeys";

// The slot names a node type declares, distributed over a node union so each type names only its own slots
export type BlockSlotName<TNode extends BlockNode> = Extract<
  TNode extends BlockNode ? SlotKeys<TNode["props"]> : never,
  string
>;
