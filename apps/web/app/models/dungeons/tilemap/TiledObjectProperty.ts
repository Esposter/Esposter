import type { TiledClassProperty } from "#src/models/dungeons/tilemap/TiledClassProperty";
import type { TiledIntProperty } from "#src/models/dungeons/tilemap/TiledIntProperty";
import type { TiledStringProperty } from "#src/models/dungeons/tilemap/TiledStringProperty";

export type TiledObjectProperty<TValue = never> =
  | TiledClassProperty<TValue>
  | TiledIntProperty<TValue>
  | TiledStringProperty<TValue>;
