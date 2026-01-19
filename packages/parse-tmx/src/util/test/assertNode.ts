import type { Except } from "type-fest";

export const assertNode = <TNode>(node: Except<TNode, "#name" & keyof TNode>): TNode => node as unknown as TNode;
