import type { TextureConfiguration } from "@/models/configuration/components/TextureConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type TextureEventEmitsOptions = {
  [P in UpdateEvent<keyof TextureConfiguration>]: [TextureConfiguration[ExtractUpdateEvent<P>]?];
};
