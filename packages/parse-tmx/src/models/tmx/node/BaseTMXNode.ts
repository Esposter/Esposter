import type { TMXNodeType } from "@/models/tmx/node/TMXNodeType";
// We extend indexable record because we can't access #name properly
// due to typescript shenanigans with private properties >:C
export interface BaseTMXNode<T> extends Record<string, unknown> {
  // @ts-expect-error Property derived from xml parsing
  #name: TMXNodeType;
  $: T;
}
