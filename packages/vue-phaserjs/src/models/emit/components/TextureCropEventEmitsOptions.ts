import type { TextureCropConfiguration } from "@/models/configuration/components/TextureCropConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type TextureCropEventEmitsOptions = {
  [P in UpdateEvent<keyof TextureCropConfiguration>]: [TextureCropConfiguration[ExtractUpdateEvent<P>]?];
};
