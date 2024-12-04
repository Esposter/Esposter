import type { BaseTextureConfiguration } from "@/models/configuration/components/BaseTextureConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type BaseTextureEventEmitsOptions = {
  [P in UpdateEvent<keyof BaseTextureConfiguration>]: [BaseTextureConfiguration[ExtractUpdateEvent<P>]?];
};
