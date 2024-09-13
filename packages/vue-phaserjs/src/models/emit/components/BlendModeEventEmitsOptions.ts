import type { BlendModeConfiguration } from "@/models/configuration/components/BlendModeConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type BlendModeEventEmitsOptions = {
  [P in UpdateEvent<keyof BlendModeConfiguration>]: [BlendModeConfiguration[ExtractUpdateEvent<P>]?];
};
