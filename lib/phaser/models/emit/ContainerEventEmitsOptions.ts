import type { ContainerConfiguration } from "@/lib/phaser/models/configuration/ContainerConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type ContainerEventEmitsOptions = {
  [P in UpdateEvent<keyof ContainerConfiguration>]: [ContainerConfiguration[ExtractUpdateEvent<P>]?];
};
