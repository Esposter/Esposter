import type { NineSliceConfiguration } from "@/models/configuration/NineSliceConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type NineSliceEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof NineSliceConfiguration>]: [NineSliceConfiguration[ExtractUpdateEvent<P>]?];
};
