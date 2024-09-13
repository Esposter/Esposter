import type { BaseTextureConfiguration } from "@/models/configuration/components/BaseTextureConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type BaseTextureEventEmitsOptions = {
  [P in UpdateEvent<keyof BaseTextureConfiguration>]: [BaseTextureConfiguration[ExtractUpdateEvent<P>]?];
};
