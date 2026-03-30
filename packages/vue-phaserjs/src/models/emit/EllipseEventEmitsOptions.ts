import type { EllipseConfiguration } from "@/models/configuration/EllipseConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type EllipseEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof EllipseConfiguration>]: [EllipseConfiguration[ExtractUpdateEvent<P>]?];
};
