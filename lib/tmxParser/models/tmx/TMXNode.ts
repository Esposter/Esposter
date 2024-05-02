import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
// We extend indexable record because we can't access #name properly
// due to typescript shenanigans with private properties >:C
export interface TMXNode<T> extends Record<string, unknown> {
  $$: TMXNode<T>[];
  $: T;
  // @ts-expect-error Property derived from standard tmx convention
  #name: string;
  _: unknown;
  properties: { property: TMXNode<TiledObjectProperty<unknown>>[] }[];
}
