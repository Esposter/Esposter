import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";

import { NotFoundError } from "@esposter/shared";

// Phaser types a Tiled layer's properties as `object[]` because Tiled writes them untyped; this is the one
// Place that gives them the shape Tiled actually emits
export const getTiledObjectProperty = <TValue = never>(properties: object[], name: string) => {
  const property = (properties as TiledObjectProperty<TValue>[]).find(
    (tiledObjectProperty) => tiledObjectProperty.name === name,
  );
  if (!property) throw new NotFoundError(getTiledObjectProperty.name, name);
  return property;
};
