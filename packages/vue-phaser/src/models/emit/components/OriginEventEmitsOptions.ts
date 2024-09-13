import type { OriginConfiguration } from "@/models/configuration/components/OriginConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type OriginEventEmitsOptions = {
  [P in UpdateEvent<keyof OriginConfiguration>]: [OriginConfiguration[ExtractUpdateEvent<P>]?];
};
