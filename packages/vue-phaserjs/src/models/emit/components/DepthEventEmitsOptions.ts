import type { DepthConfiguration } from "@/models/configuration/components/DepthConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type DepthEventEmitsOptions = {
  [P in UpdateEvent<keyof DepthConfiguration>]: [DepthConfiguration[ExtractUpdateEvent<P>]?];
};
