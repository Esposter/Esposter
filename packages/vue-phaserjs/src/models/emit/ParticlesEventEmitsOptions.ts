import type { ParticlesConfiguration } from "@/models/configuration/ParticlesConfiguration";
import type { GameObjectEventMapEmitsOptions } from "@/models/emit/shared/GameObjectEventMapEmitsOptions";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type ParticlesEventEmitsOptions = GameObjectEventMapEmitsOptions & {
  [P in UpdateEvent<keyof ParticlesConfiguration>]: [ParticlesConfiguration[ExtractUpdateEvent<P>]?];
};
