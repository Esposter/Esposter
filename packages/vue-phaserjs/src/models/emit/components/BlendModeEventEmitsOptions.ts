import type { BlendModeConfiguration } from "@/models/configuration/components/BlendModeConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type BlendModeEventEmitsOptions = {
  [P in UpdateEvent<keyof BlendModeConfiguration>]: [BlendModeConfiguration[ExtractUpdateEvent<P>]?];
};
