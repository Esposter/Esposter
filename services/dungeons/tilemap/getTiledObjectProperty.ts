import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import { NotFoundError } from "@/models/error/NotFoundError";

export const getTiledObjectProperty = <T>(properties: object[], name: string) => {
  const property = (properties as TiledObjectProperty<T>[]).find((p) => p.name === name);
  if (!property) throw new NotFoundError(getTiledObjectProperty.name, name);
  return property;
};
