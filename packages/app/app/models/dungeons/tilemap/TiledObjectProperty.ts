import type { PropertyType } from "@/models/dungeons/tilemap/PropertyType";

export type TiledObjectProperty<TValue = never> =
  | {
      name: string;
      // The enum if it exists
      propertyType?: string;
      type: PropertyType.string;
      value: TValue;
    }
  | {
      name: string;
      propertyType: string;
      type: PropertyType.class;
      value: TValue;
    }
  | {
      name: string;
      type: PropertyType.int;
      value: TValue extends never ? number : TValue;
    };
