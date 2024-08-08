import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";

export interface ClassPropertyType {
  color: string;
  drawFill: boolean;
  id: number;
  members: TiledObjectProperty[];
  name: string;
  type: PropertyType.class;
  useAs: string[];
}
