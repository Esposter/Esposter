import type { ZoneConfiguration } from "@/lib/phaser/models/configuration/ZoneConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type ZoneEventEmitsOptions = {
  [P in UpdateEvent<keyof ZoneConfiguration>]: [ZoneConfiguration[ExtractUpdateEvent<P>]?];
};
