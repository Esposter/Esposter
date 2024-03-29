import type { TileSpriteConfiguration } from "@/lib/phaser/models/configuration/TileSpriteConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type TileSpriteEventEmitsOptions = {
  [P in UpdateEvent<keyof TileSpriteConfiguration>]: [TileSpriteConfiguration[ExtractUpdateEvent<P>]?];
} & Record<string, unknown[]>;
