import type { IsoBoxConfiguration } from "@/models/configuration/IsoBoxConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type IsoBoxEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof IsoBoxConfiguration>]: [IsoBoxConfiguration[ExtractUpdateEvent<P>]?];
};
