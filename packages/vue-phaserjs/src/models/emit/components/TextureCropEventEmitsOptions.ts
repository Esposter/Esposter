import type { TextureCropConfiguration } from "@/models/configuration/components/TextureCropConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type TextureCropEventEmitsOptions = {
  [P in UpdateEvent<keyof TextureCropConfiguration>]: [TextureCropConfiguration[ExtractUpdateEvent<P>]?];
};
