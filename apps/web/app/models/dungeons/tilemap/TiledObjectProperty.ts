import type { TiledClassProperty } from "@/models/dungeons/tilemap/TiledClassProperty";
import type { TiledIntProperty } from "@/models/dungeons/tilemap/TiledIntProperty";
import type { TiledStringProperty } from "@/models/dungeons/tilemap/TiledStringProperty";

export type TiledObjectProperty<TValue = never> =
  | TiledClassProperty<TValue>
  | TiledIntProperty<TValue>
  | TiledStringProperty<TValue>;
