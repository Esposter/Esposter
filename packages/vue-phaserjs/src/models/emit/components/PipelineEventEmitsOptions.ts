import type { PipelineConfiguration } from "@/models/configuration/components/PipelineConfiguration";
import type { ExtractUpdateEvent } from "@/util/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/util/types/UpdateEvent";

export type PipelineEventEmitsOptions = {
  [P in UpdateEvent<keyof PipelineConfiguration>]: [PipelineConfiguration[ExtractUpdateEvent<P>]?];
};
