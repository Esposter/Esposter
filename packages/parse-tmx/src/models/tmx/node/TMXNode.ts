import type { BaseTMXNode } from "@/models/tmx/node/BaseTMXNode";
// For convenience's sake, we will assume that parsing xml will always have
// explicitChildren && preserveChildrenOrder set to true and we will type that instead
// We deal with dynamic xml data by typing it explicitly in the specific types that extend this interface
export type TMXNode<T, TChildNode extends BaseTMXNode<unknown> | undefined = undefined> = BaseTMXNode<T> & {
  $$: TChildNode extends undefined ? undefined : TChildNode[];
};
