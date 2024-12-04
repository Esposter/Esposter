import type { AlphaConfiguration } from "@/models/configuration/components/AlphaConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type AlphaEventEmitsOptions = {
  [P in UpdateEvent<keyof AlphaConfiguration>]: [AlphaConfiguration[ExtractUpdateEvent<P>]?];
};
