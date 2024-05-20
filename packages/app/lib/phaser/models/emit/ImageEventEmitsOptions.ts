import type { ImageConfiguration } from "@/lib/phaser/models/configuration/ImageConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/lib/phaser/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type ImageEventEmitsOptions = {
  [P in UpdateEvent<keyof ImageConfiguration>]: [ImageConfiguration[ExtractUpdateEvent<P>]?];
} & GameObjectEventMapEmitsOptions;
