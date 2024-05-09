import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";

export interface ClassPropertyType {
  id: number;
  name: string;
  type: PropertyType.class;
  color: string;
  drawFill: boolean;
  members: TiledObjectProperty[];
  useAs: string[];
}
