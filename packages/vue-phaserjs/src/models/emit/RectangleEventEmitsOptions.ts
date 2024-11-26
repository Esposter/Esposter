import type { RectangleConfiguration } from "@/models/configuration/RectangleConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type RectangleEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof RectangleConfiguration>]: [RectangleConfiguration[ExtractUpdateEvent<P>]?];
};
