import type { ArcConfiguration } from "@/models/configuration/ArcConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type ArcEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof ArcConfiguration>]: [ArcConfiguration[ExtractUpdateEvent<P>]?];
};
