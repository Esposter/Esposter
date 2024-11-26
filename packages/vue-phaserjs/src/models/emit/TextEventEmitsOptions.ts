import type { TextConfiguration } from "@/models/configuration/TextConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type TextEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof TextConfiguration>]: [TextConfiguration[ExtractUpdateEvent<P>]?];
};
