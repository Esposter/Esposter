import type { ItemEntityType } from "#shared/models/entity/ItemEntityType";
import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";
import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";

export interface ClassPropertyType extends ItemEntityType<PropertyType.class> {
  color: string;
  drawFill: boolean;
  id: number;
  members: TiledObjectProperty[];
  name: string;
  useAs: string[];
}
