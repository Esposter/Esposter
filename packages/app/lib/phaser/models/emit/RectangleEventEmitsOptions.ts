import type { RectangleConfiguration } from "@/lib/phaser/models/configuration/RectangleConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/lib/phaser/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type RectangleEventEmitsOptions = {
  [P in UpdateEvent<keyof RectangleConfiguration>]: [RectangleConfiguration[ExtractUpdateEvent<P>]?];
} & GameObjectEventMapEmitsOptions;
