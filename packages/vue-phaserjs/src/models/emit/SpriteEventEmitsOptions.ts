import type { SpriteConfiguration } from "@/models/configuration/SpriteConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type SpriteEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof SpriteConfiguration>]: [SpriteConfiguration[ExtractUpdateEvent<P>]?];
};
