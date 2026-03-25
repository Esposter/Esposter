import type { StarConfiguration } from "@/models/configuration/StarConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type StarEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof StarConfiguration>]: [StarConfiguration[ExtractUpdateEvent<P>]?];
};
