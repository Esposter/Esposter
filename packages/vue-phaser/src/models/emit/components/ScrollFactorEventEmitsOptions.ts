import type { ScrollFactorConfiguration } from "@/models/configuration/components/ScrollFactorConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type ScrollFactorEventEmitsOptions = {
  [P in UpdateEvent<keyof ScrollFactorConfiguration>]: [ScrollFactorConfiguration[ExtractUpdateEvent<P>]?];
};
