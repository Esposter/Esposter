import type { PathFollowerConfiguration } from "@/models/configuration/PathFollowerConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type PathFollowerEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof PathFollowerConfiguration>]: [PathFollowerConfiguration[ExtractUpdateEvent<P>]?];
};
