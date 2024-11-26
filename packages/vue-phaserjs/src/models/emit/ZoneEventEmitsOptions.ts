import type { ZoneConfiguration } from "@/models/configuration/ZoneConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type ZoneEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof ZoneConfiguration>]: [ZoneConfiguration[ExtractUpdateEvent<P>]?];
};
