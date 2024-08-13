import type { TileSpriteConfiguration } from "@/lib/phaser/models/configuration/TileSpriteConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/lib/phaser/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type TileSpriteEventEmitsOptions = {
  [P in UpdateEvent<keyof TileSpriteConfiguration>]: [TileSpriteConfiguration[ExtractUpdateEvent<P>]?];
} & GameObjectEventMapEmitsOptions &
  Record<string, unknown[]>;
