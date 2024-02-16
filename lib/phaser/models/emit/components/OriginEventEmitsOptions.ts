import { type OriginConfiguration } from "@/lib/phaser/models/configuration/components/OriginConfiguration";
import { type ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import { type UpdateEvent } from "@/util/types/UpdateEvent";

export type OriginEventEmitsOptions = {
  [P in UpdateEvent<keyof OriginConfiguration>]: [OriginConfiguration[ExtractUpdateEvent<P>]?];
};
