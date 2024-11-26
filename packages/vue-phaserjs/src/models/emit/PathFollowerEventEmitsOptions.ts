import type { PathFollowerConfiguration } from "@/models/configuration/PathFollowerConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type PathFollowerEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof PathFollowerConfiguration>]: [PathFollowerConfiguration[ExtractUpdateEvent<P>]?];
};
