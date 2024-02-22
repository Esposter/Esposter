import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";

export const findTiledObjectProperty = <T>(properties: TiledObjectProperty<T>[], name: string) =>
  properties.find((p) => p.name === name);
