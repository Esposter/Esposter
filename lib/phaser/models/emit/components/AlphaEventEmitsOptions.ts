import { type AlphaConfiguration } from "@/lib/phaser/models/configuration/components/AlphaConfiguration";
import { type ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import { type UpdateEvent } from "@/util/types/UpdateEvent";

export type AlphaEventEmitsOptions = {
  [P in UpdateEvent<keyof AlphaConfiguration>]: [AlphaConfiguration[ExtractUpdateEvent<P>]?];
};
