// We extend indexable record because we can't access #name properly
// due to typescript shenanigans with private properties >:C
interface BaseTMXNode<T> extends Record<string, unknown> {
  $$: TMXNode<T>[];
  $: T;
  // @ts-expect-error Property derived from standard tmx convention
  #name: string;
  _: unknown;
}

export type TMXNode<T> = BaseTMXNode<T> & T;
