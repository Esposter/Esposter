import { type ScrollFactorConfiguration } from "@/lib/phaser/models/configuration/components/ScrollFactorConfiguration";
import { type ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import { type UpdateEvent } from "@/util/types/UpdateEvent";

export type ScrollFactorEventEmitsOptions = {
  [P in UpdateEvent<keyof ScrollFactorConfiguration>]: [ScrollFactorConfiguration[ExtractUpdateEvent<P>]?];
};
