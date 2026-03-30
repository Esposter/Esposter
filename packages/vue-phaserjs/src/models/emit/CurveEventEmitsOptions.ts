import type { CurveConfiguration } from "@/models/configuration/CurveConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type CurveEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof CurveConfiguration>]: [CurveConfiguration[ExtractUpdateEvent<P>]?];
};
