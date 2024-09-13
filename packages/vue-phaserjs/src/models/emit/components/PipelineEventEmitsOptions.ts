import type { PipelineConfiguration } from "@/models/configuration/components/PipelineConfiguration";
import type { ExtractUpdateEvent } from "@/utils/types/ExtractUpdateEvent";
import type { UpdateEvent } from "@/utils/types/UpdateEvent";

export type PipelineEventEmitsOptions = {
  [P in UpdateEvent<keyof PipelineConfiguration>]: [PipelineConfiguration[ExtractUpdateEvent<P>]?];
};
