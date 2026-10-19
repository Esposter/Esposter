import type { BlockNode } from "#src/models/BlockNode";

// The type of the nodes a slot's list holds
export type NodeTypeOf<TList> = TList extends BlockNode[] ? TList[number]["type"] : never;
