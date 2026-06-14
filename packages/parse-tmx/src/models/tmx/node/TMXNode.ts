import type { BaseTMXNode } from "@/models/tmx/node/BaseTMXNode";
// Assume xml parsing always runs with explicitChildren && preserveChildrenOrder, and type for that.
// Dynamic xml data is typed explicitly in the specific types that extend this interface.
export type TMXNode<T, TChildNode extends BaseTMXNode<unknown> | undefined = undefined> = BaseTMXNode<T> & {
  $$: TChildNode extends undefined ? undefined : TChildNode[];
};
