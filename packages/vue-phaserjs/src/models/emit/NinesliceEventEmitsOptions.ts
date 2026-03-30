import type { NinesliceConfiguration } from "@/models/configuration/NinesliceConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type NinesliceEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof NinesliceConfiguration>]: [NinesliceConfiguration[ExtractUpdateEvent<P>]?];
};
