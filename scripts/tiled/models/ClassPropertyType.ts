import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import type { PropertyType } from "@/scripts/tiled/models/PropertyType";

export interface ClassPropertyType {
  id: number;
  name: string;
  type: PropertyType.class;
  color: string;
  drawFill: boolean;
  members: TiledObjectProperty<unknown>[];
  useAs: string[];
}
