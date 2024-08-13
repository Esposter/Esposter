import type { SpriteConfiguration } from "@/lib/phaser/models/configuration/SpriteConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/lib/phaser/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type SpriteEventEmitsOptions = {
  [P in UpdateEvent<keyof SpriteConfiguration>]: [SpriteConfiguration[ExtractUpdateEvent<P>]?];
} & GameObjectEventMapEmitsOptions &
  Record<string, unknown[]>;
