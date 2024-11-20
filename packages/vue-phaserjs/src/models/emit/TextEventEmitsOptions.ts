import type { TextConfiguration } from "@/models/configuration/TextConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type TextEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof TextConfiguration>]: [TextConfiguration[ExtractUpdateEvent<P>]?];
};
