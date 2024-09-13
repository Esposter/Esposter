import type { ZoneConfiguration } from "@/models/configuration/ZoneConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type ZoneEventEmitsOptions = {
  [P in UpdateEvent<keyof ZoneConfiguration>]: [ZoneConfiguration[ExtractUpdateEvent<P>]?];
} & GameObjectEventMapEmitsOptions;
