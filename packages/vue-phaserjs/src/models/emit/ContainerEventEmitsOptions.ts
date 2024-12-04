import type { ContainerConfiguration } from "@/models/configuration/ContainerConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type ContainerEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof ContainerConfiguration>]: [ContainerConfiguration[ExtractUpdateEvent<P>]?];
};
