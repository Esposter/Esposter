import type { LineConfiguration } from "@/models/configuration/LineConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type LineEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof LineConfiguration>]: [LineConfiguration[ExtractUpdateEvent<P>]?];
};
