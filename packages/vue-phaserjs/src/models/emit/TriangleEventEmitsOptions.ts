import type { TriangleConfiguration } from "@/models/configuration/TriangleConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type TriangleEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof TriangleConfiguration>]: [TriangleConfiguration[ExtractUpdateEvent<P>]?];
};
