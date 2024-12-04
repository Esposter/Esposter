import type { DepthConfiguration } from "@/models/configuration/components/DepthConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type DepthEventEmitsOptions = {
  [P in UpdateEvent<keyof DepthConfiguration>]: [DepthConfiguration[ExtractUpdateEvent<P>]?];
};
