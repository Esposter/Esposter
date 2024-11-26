import type { ImageConfiguration } from "@/models/configuration/ImageConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type ImageEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof ImageConfiguration>]: [ImageConfiguration[ExtractUpdateEvent<P>]?];
};
