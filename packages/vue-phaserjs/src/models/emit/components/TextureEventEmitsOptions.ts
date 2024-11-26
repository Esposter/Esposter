import type { TextureConfiguration } from "@/models/configuration/components/TextureConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type TextureEventEmitsOptions = {
  [P in UpdateEvent<keyof TextureConfiguration>]: [TextureConfiguration[ExtractUpdateEvent<P>]?];
};
