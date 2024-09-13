import type { ContainerConfiguration } from "@/models/configuration/ContainerConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type ContainerEventEmitsOptions = {
  [P in UpdateEvent<keyof ContainerConfiguration>]: [ContainerConfiguration[ExtractUpdateEvent<P>]?];
} & GameObjectEventMapEmitsOptions;
