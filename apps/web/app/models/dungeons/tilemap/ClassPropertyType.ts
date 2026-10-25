import type { TiledObjectProperty } from "@/models/dungeons/tilemap/TiledObjectProperty";
import type { ItemEntityType } from "@esposter/shared";
import type { PropertyType } from "parse-tmx";

export interface ClassPropertyType extends ItemEntityType<PropertyType.Class> {
  color: string;
  drawFill: boolean;
  id: number;
  members: TiledObjectProperty[];
  name: string;
  useAs: string[];
}
