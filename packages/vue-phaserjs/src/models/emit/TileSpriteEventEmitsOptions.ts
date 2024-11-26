import type { TileSpriteConfiguration } from "@/models/configuration/TileSpriteConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type TileSpriteEventEmitsOptions = GameObjectEventMapEmitsOptions &
  Record<string, unknown[]> & {
    [P in UpdateEvent<keyof TileSpriteConfiguration>]: [TileSpriteConfiguration[ExtractUpdateEvent<P>]?];
  };
