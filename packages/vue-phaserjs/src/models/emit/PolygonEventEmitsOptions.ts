import type { PolygonConfiguration } from "@/models/configuration/PolygonConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type PolygonEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof PolygonConfiguration>]: [PolygonConfiguration[ExtractUpdateEvent<P>]?];
};
