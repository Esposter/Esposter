import type { AlphaConfiguration } from "@/models/configuration/components/AlphaConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type AlphaEventEmitsOptions = {
  [P in UpdateEvent<keyof AlphaConfiguration>]: [AlphaConfiguration[ExtractUpdateEvent<P>]?];
};
