import type { BitmapTextConfiguration } from "@/models/configuration/BitmapTextConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type BitmapTextEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof BitmapTextConfiguration>]: [BitmapTextConfiguration[ExtractUpdateEvent<P>]?];
};
