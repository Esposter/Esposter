import type { BlockNode } from "#src/models/BlockNode";
import type { BlockNodeProps } from "#src/models/BlockNodeProps";

// The keys of a props type whose value is a list of nodes: the slots a node's type holds its children in
export type SlotKeys<TProps extends BlockNodeProps> = {
  [K in keyof TProps]: TProps[K] extends BlockNode[] ? K : never;
}[keyof TProps];
