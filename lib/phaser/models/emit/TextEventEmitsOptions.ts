import type { TextConfiguration } from "@/lib/phaser/models/configuration/TextConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/lib/phaser/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type TextEventEmitsOptions = {
  [P in UpdateEvent<keyof TextConfiguration>]: [TextConfiguration[ExtractUpdateEvent<P>]?];
} & GameObjectEventMapEmitsOptions;
