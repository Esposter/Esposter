import type { PathFollowerConfiguration } from "@/lib/phaser/models/configuration/PathFollowerConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/lib/phaser/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type PathFollowerEventEmitsOptions = {
  [P in UpdateEvent<keyof PathFollowerConfiguration>]: [PathFollowerConfiguration[ExtractUpdateEvent<P>]?];
} & GameObjectEventMapEmitsOptions;
