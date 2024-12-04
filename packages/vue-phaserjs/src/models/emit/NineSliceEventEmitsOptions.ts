import type { NineSliceConfiguration } from "@/models/configuration/NineSliceConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type NineSliceEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof NineSliceConfiguration>]: [NineSliceConfiguration[ExtractUpdateEvent<P>]?];
};
