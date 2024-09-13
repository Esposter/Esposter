import type { MaskConfiguration } from "@/models/configuration/components/MaskConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type MaskEventEmitsOptions = {
  [P in UpdateEvent<keyof MaskConfiguration>]: [MaskConfiguration[ExtractUpdateEvent<P>]?];
};
