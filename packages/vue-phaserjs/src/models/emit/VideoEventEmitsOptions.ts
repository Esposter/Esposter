import type { VideoConfiguration } from "@/models/configuration/VideoConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type VideoEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof VideoConfiguration>]: [VideoConfiguration[ExtractUpdateEvent<P>]?];
};
