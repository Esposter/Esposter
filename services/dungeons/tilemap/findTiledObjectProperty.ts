import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";

export const findTiledObjectProperty = <T>(properties: object[], name: string) =>
  (properties as TiledObjectProperty<T>[]).find((p) => p.name === name);
