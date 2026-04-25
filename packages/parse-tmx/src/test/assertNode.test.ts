import type { Except } from "type-fest";

import { describe } from "vitest";

export const assertNode = <TNode>(node: Except<TNode, "#name" & keyof TNode>): TNode => node as unknown as TNode;

describe.todo(assertNode);
