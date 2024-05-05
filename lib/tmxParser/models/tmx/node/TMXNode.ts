import type { TMXNodeType } from "@/lib/tmxParser/models/tmx/node/TMXNodeType";
// We extend indexable record because we can't access #name properly
// due to typescript shenanigans with private properties >:C
interface BaseTMXNode<T> extends Record<string, unknown> {
  $: T;
  // @ts-expect-error Property derived from standard tmx convention
  #name: TMXNodeType;
}
// For convenience's sake, we will assume that parsing xml will always have
// explicitChildren && preserveChildrenOrder set to true and we will type that instead
// so it's easier on the typescript side rather than having to deal with dynamic xml data
// We will ignore the duplicated parsed data in this way, which is fine
export type TMXNode<T, TChildNode extends BaseTMXNode<unknown> | undefined = undefined> = BaseTMXNode<T> & {
  $$: TChildNode extends undefined ? undefined : TChildNode[];
};
