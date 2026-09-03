import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";

import { NotFoundError } from "@esposter/shared";

export const getTiledObjectProperty = <TValue = never>(properties: object[], name: string) => {
  const property = (properties as TiledObjectProperty<TValue>[]).find(
    (tiledObjectProperty) => tiledObjectProperty.name === name,
  );
  if (!property) throw new NotFoundError(getTiledObjectProperty.name, name);
  return property;
};
