import type { BlockNode } from "#src/models/BlockNode";
import type { NodeTypeOf } from "#src/models/NodeTypeOf";
import type { OwnProps } from "#src/models/OwnProps";
import type { SlotKeys } from "#src/models/SlotKeys";
import type { z } from "zod";

// One entry of a consumer's registry: the props a node of this type declares besides its id and slots, and for each slot the child types it allows
export interface BlockTypeDefinition<TNode extends BlockNode = BlockNode> {
  propsSchema: z.ZodType<OwnProps<TNode["props"]>>;
  slots: { [K in SlotKeys<TNode["props"]>]: NodeTypeOf<TNode["props"][K]>[] };
  type: TNode["type"];
}
