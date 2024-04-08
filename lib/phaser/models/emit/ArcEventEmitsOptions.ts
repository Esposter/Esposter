import type { ArcConfiguration } from "@/lib/phaser/models/configuration/ArcConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/lib/phaser/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type ArcEventEmitsOptions = {
  [P in UpdateEvent<keyof ArcConfiguration>]: [ArcConfiguration[ExtractUpdateEvent<P>]?];
} & GameObjectEventMapEmitsOptions;
