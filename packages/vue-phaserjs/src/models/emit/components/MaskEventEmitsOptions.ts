import type { MaskConfiguration } from "@/models/configuration/components/MaskConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type MaskEventEmitsOptions = {
  [P in UpdateEvent<keyof MaskConfiguration>]: [MaskConfiguration[ExtractUpdateEvent<P>]?];
};
