import type { TeleportId } from "#shared/generated/tiled/propertyTypes/enum/TeleportId";
import type { TilemapKey } from "#shared/generated/tiled/propertyTypes/enum/TilemapKey";

export interface TeleportTarget {
  id: TeleportId;
  tilemapKey: TilemapKey;
}
