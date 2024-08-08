import type { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
// We extend indexable record because we can't access #name properly
// due to typescript shenanigans with private properties >:C
interface BaseTMXNode<T> extends Record<string, unknown> {
  // @ts-expect-error Property derived from xml parsing
  #name: TMXNodeType;
  $: T;
}
// For convenience's sake, we will assume that parsing xml will always have
// explicitChildren && preserveChildrenOrder set to true and we will type that instead
// We deal with dynamic xml data by typing it explicitly in the specific types that extend this interface
export type TMXNode<T, TChildNode extends BaseTMXNode<unknown> | undefined = undefined> = {
  $$: TChildNode extends undefined ? undefined : TChildNode[];
} & BaseTMXNode<T>;
