import type { GraphicsConfiguration } from "@/models/configuration/GraphicsConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type GraphicsEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof GraphicsConfiguration>]: [GraphicsConfiguration[ExtractUpdateEvent<P>]?];
};
